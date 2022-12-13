#!/bin/bash
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
set -e

if [ -z "${BRIDGE_VERSION_RC}" ] || [ -z "${BRIDGE_SVN_DEV_PATH}" ] || [ -z "${BRIDGE_VERSION}" ]; then
  echo "BRIDGE_VERSION_RC, BRIDGE_SVN_DEV_PATH and BRIDGE_VERSION are required to run this container"
  exit 1
fi

BRIDGE_RELEASE_RC=apache-bridge-"${BRIDGE_VERSION_RC}"
BRIDGE_RELEASE_RC_TARBALL="${BRIDGE_RELEASE_RC}"-source.tar.gz
BRIDGE_RELEASE_RC_BASE_PATH="${BRIDGE_SVN_DEV_PATH}"/"${BRIDGE_VERSION_RC}"
BRIDGE_RELEASE_RC_TARBALL_PATH="${BRIDGE_RELEASE_RC_BASE_PATH}"/"${BRIDGE_RELEASE_RC_TARBALL}"

# Create directory release version
mkdir -p "${BRIDGE_SVN_DEV_PATH}"/"${BRIDGE_VERSION_RC}"

# Clone bridge from tag to /tmp
cd /tmp
git clone --depth 1 --branch ${BRIDGE_VERSION_RC} https://github.com/kiranbmore0101/bridge.git
mkdir -p "${HOME}/${BRIDGE_VERSION_RC}"
cd bridge && \

# Check RC version
if ! jq -e --arg BRIDGE_VERSION $BRIDGE_VERSION '.version == $BRIDGE_VERSION' bridge-frontend/package.json
then
  SOURCE_VERSION=$(jq '.version' bridge-frontend/package.json)
  echo "Source package.json version is wrong, found: ${SOURCE_VERSION} should be: ${BRIDGE_VERSION}"
  exit 1
fi

# Create source tarball
git archive \
    --format=tar.gz "${BRIDGE_VERSION_RC}" \
    --prefix="${BRIDGE_RELEASE_RC}/" \
    -o "${BRIDGE_RELEASE_RC_TARBALL_PATH}"

chown -R ${HOST_UID}:${HOST_UID} "${BRIDGE_RELEASE_RC_BASE_PATH}"
