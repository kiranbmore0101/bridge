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

usage() {
   echo "usage: make_tarball.sh <BRIDGE_VERSION> <BRIDGE_RC> <PGP_KEY_FULLBANE>"
}

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
  if [ -z "${BRIDGE_VERSION}" ] || [ -z "${BRIDGE_RC}" ] || [ -z "${BRIDGE_PGP_FULLNAME}" ] || [ -z "${BRIDGE_RELEASE_RC_TARBALL}" ]; then
    echo "No parameters found and no required environment variables set"
    echo "usage: make_tarball.sh <BRIDGE_VERSION> <BRIDGE_RC> <PGP_KEY_FULLBANE>"
    usage;
    exit 1
  fi
else
  BRIDGE_VERSION="${1}"
  BRIDGE_RC="${2}"
  BRIDGE_PGP_FULLNAME="${3}"
  BRIDGE_RELEASE_RC_TARBALL="apache-bridge-${BRIDGE_VERSION_RC}-source.tar.gz"
fi

BRIDGE_VERSION_RC="${BRIDGE_VERSION}rc${BRIDGE_RC}"

if [ -z "${BRIDGE_SVN_DEV_PATH}" ]; then
  BRIDGE_SVN_DEV_PATH="$HOME/svn/bridge_dev"
fi

if [[ ! -d "${BRIDGE_SVN_DEV_PATH}" ]]; then
  echo "${BRIDGE_SVN_DEV_PATH} does not exist, you need to: svn checkout"
  exit 1
fi

if [ -d "${BRIDGE_SVN_DEV_PATH}/${BRIDGE_VERSION_RC}" ]; then
  echo "${BRIDGE_VERSION_RC} Already exists on svn, refusing to overwrite"
  exit 1
fi

BRIDGE_RELEASE_RC_TARBALL_PATH="${BRIDGE_SVN_DEV_PATH}"/"${BRIDGE_VERSION_RC}"/"${BRIDGE_RELEASE_RC_TARBALL}"
DOCKER_SVN_PATH="/docker_svn"

# Building docker that will produce a tarball
docker build -t apache-builder -f Dockerfile.make_tarball .

# Running docker to produce a tarball
docker run \
      -e BRIDGE_SVN_DEV_PATH="${DOCKER_SVN_PATH}" \
      -e BRIDGE_VERSION="${BRIDGE_VERSION}" \
      -e BRIDGE_VERSION_RC="${BRIDGE_VERSION_RC}" \
      -e HOST_UID=${UID} \
      -v "${BRIDGE_SVN_DEV_PATH}":"${DOCKER_SVN_PATH}":rw \
      -ti apache-builder

gpg --armor --local-user "${BRIDGE_PGP_FULLNAME}" --output "${BRIDGE_RELEASE_RC_TARBALL_PATH}".asc --detach-sig "${BRIDGE_RELEASE_RC_TARBALL_PATH}"
gpg --print-md --local-user "${BRIDGE_PGP_FULLNAME}" SHA512 "${BRIDGE_RELEASE_RC_TARBALL_PATH}" > "${BRIDGE_RELEASE_RC_TARBALL_PATH}".sha512

echo ---------------------------------------
echo Release candidate tarball is ready
echo ---------------------------------------
