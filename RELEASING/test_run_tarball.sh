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

if [ -z "${BRIDGE_VERSION_RC}" ]; then
  echo "BRIDGE_VERSION_RC is required to run this container"
  exit 1
fi

if [ -z "${BRIDGE_SVN_DEV_PATH}" ]; then
  BRIDGE_SVN_DEV_PATH="$HOME/svn/bridge_dev"
fi

if [[ -n ${1} ]] && [[ ${1} == "local" ]]; then
  BRIDGE_RELEASE_RC=apache-bridge-"${BRIDGE_VERSION_RC}"
  BRIDGE_RELEASE_RC_TARBALL="${BRIDGE_RELEASE_RC}"-source.tar.gz
  BRIDGE_TARBALL_PATH="${BRIDGE_SVN_DEV_PATH}"/${BRIDGE_VERSION_RC}/${BRIDGE_RELEASE_RC_TARBALL}
  BRIDGE_TMP_TARBALL_FILENAME=_tmp_"${BRIDGE_VERSION_RC}".tar.gz
  cp "${BRIDGE_TARBALL_PATH}" "${BRIDGE_TMP_TARBALL_FILENAME}"
  docker build --no-cache \
        -t apache-bridge:${BRIDGE_VERSION_RC} \
        -f Dockerfile.from_local_tarball . \
        --build-arg VERSION=${BRIDGE_VERSION_RC} \
        --build-arg BRIDGE_BUILD_FROM=local \
        --build-arg BRIDGE_RELEASE_RC_TARBALL="${BRIDGE_TMP_TARBALL_FILENAME}"
  rm "${BRIDGE_TMP_TARBALL_FILENAME}"
else
  # Building a docker from a tarball
  docker build --no-cache \
        -t apache-bridge:${BRIDGE_VERSION_RC} \
        -f Dockerfile.from_svn_tarball . \
        --build-arg VERSION=${BRIDGE_VERSION_RC} \
        --build-arg BRIDGE_BUILD_FROM=svn
fi

echo "---------------------------------------------------"
echo "After docker build and run, you should be able to access localhost:5001 on your browser"
echo "login using admin/admin"
echo "---------------------------------------------------"
if ! docker run -p 5001:8088 apache-bridge:${BRIDGE_VERSION_RC}; then
  echo "---------------------------------------------------"
  echo "[ERROR] Seems like this apache-bridge:${BRIDGE_VERSION_RC} has a setup/startup problem!"
  echo "---------------------------------------------------"
fi
