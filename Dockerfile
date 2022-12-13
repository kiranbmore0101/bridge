#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

######################################################################
# Node stage to deal with static asset construction
######################################################################
ARG PY_VER=3.8.13-slim
FROM node:16-slim AS bridge-node

ARG NPM_BUILD_CMD="build"
ENV BUILD_CMD=${NPM_BUILD_CMD}

# NPM ci first, as to NOT invalidate previous steps except for when package.json changes
RUN mkdir -p /app/bridge-frontend

COPY ./docker/frontend-mem-nag.sh /
RUN /frontend-mem-nag.sh

WORKDIR /app/bridge-frontend/

COPY bridge-frontend/package*.json ./
RUN npm ci

COPY ./bridge-frontend .

# This seems to be the most expensive step
RUN npm run ${BUILD_CMD}

######################################################################
# Final lean image...
######################################################################
FROM python:${PY_VER} AS lean

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    FLASK_ENV=production \
    FLASK_APP="bridge.app:create_app()" \
    PYTHONPATH="/app/pythonpath" \
    BRIDGE_HOME="/app/bridge_home" \
    BRIDGE_PORT=8088

RUN mkdir -p ${PYTHONPATH} \
        && useradd --user-group -d ${BRIDGE_HOME} -m --no-log-init --shell /bin/bash bridge \
        && apt-get update -y \
        && apt-get install -y --no-install-recommends \
            build-essential \
            default-libmysqlclient-dev \
            libsasl2-dev \
            libsasl2-modules-gssapi-mit \
            libpq-dev \
            libecpg-dev \
        && rm -rf /var/lib/apt/lists/*

COPY ./requirements/*.txt  /app/requirements/
COPY setup.py MANIFEST.in README.md /app/

# setup.py uses the version information in package.json
COPY bridge-frontend/package.json /app/bridge-frontend/

RUN cd /app \
    && mkdir -p bridge/static \
    && touch bridge/static/version_info.json \
    && pip install --no-cache -r requirements/local.txt

COPY --from=bridge-node /app/bridge/static/assets /app/bridge/static/assets

## Lastly, let's install bridge itself
COPY bridge /app/bridge
COPY setup.py MANIFEST.in README.md /app/
RUN cd /app \
        && chown -R bridge:bridge * \
        && pip install -e . \
        && flask fab babel-compile --target bridge/translations

COPY ./docker/run-server.sh /usr/bin/

RUN chmod a+x /usr/bin/run-server.sh

WORKDIR /app

USER bridge

HEALTHCHECK CMD curl -f "http://localhost:$BRIDGE_PORT/health"

EXPOSE ${BRIDGE_PORT}

CMD /usr/bin/run-server.sh

######################################################################
# Dev image...
######################################################################
FROM lean AS dev
ARG GECKODRIVER_VERSION=v0.32.0
ARG FIREFOX_VERSION=106.0.3

COPY ./requirements/*.txt ./docker/requirements-*.txt/ /app/requirements/

USER root

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends libnss3 libdbus-glib-1-2 libgtk-3-0 libx11-xcb1 wget

# Install GeckoDriver WebDriver
RUN wget https://github.com/mozilla/geckodriver/releases/download/${GECKODRIVER_VERSION}/geckodriver-${GECKODRIVER_VERSION}-linux64.tar.gz -O /tmp/geckodriver.tar.gz && \
    tar xvfz /tmp/geckodriver.tar.gz -C /tmp && \
    mv /tmp/geckodriver /usr/local/bin/geckodriver && \
    rm /tmp/geckodriver.tar.gz

# Install Firefox
RUN wget https://download-installer.cdn.mozilla.net/pub/firefox/releases/${FIREFOX_VERSION}/linux-x86_64/en-US/firefox-${FIREFOX_VERSION}.tar.bz2 -O /opt/firefox.tar.bz2 && \
    tar xvf /opt/firefox.tar.bz2 -C /opt && \
    ln -s /opt/firefox/firefox /usr/local/bin/firefox

# Cache everything for dev purposes...
RUN cd /app \
    && pip install --no-cache -r requirements/docker.txt \
    && pip install --no-cache -r requirements/requirements-local.txt || true
USER bridge


######################################################################
# CI image...
######################################################################
FROM lean AS ci

COPY --chown=bridge ./docker/docker-bootstrap.sh /app/docker/
COPY --chown=bridge ./docker/docker-init.sh /app/docker/
COPY --chown=bridge ./docker/docker-ci.sh /app/docker/

RUN chmod a+x /app/docker/*.sh

CMD /app/docker/docker-ci.sh
