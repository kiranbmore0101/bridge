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

# Python version installed; we need 3.8-3.11
PYTHON=`command -v python3.11 || command -v python3.10 || command -v python3.9 || command -v python3.8`

.PHONY: install bridge venv pre-commit

install: bridge pre-commit

bridge:
	# Install external dependencies
	pip install -r requirements/local.txt

	# Install Bridge in editable (development) mode
	pip install -e .

	# Create an admin user in your metadata database
	bridge fab create-admin \
                    --username admin \
                    --firstname "Admin I."\
                    --lastname Strator \
                    --email admin@bridge.io \
                    --password general

	# Initialize the database
	bridge db upgrade

	# Create default roles and permissions
	bridge init

	# Load some data to play with
	bridge load-examples

	# Install node packages
	cd bridge-frontend; npm ci

update: update-py update-js

update-py:
	# Install external dependencies
	pip install -r requirements/local.txt

	# Install Bridge in editable (development) mode
	pip install -e .

	# Initialize the database
	bridge db upgrade

	# Create default roles and permissions
	bridge init

update-js:
	# Install js packages
	cd bridge-frontend; npm ci

venv:
	# Create a virtual environment and activate it (recommended)
	if ! [ -x "${PYTHON}" ]; then echo "You need Python 3.8, 3.9, 3.10 or 3.11 installed"; exit 1; fi
	test -d venv || ${PYTHON} -m venv venv # setup a python3 virtualenv
	. venv/bin/activate

activate:
	. venv/bin/activate

pre-commit:
	# setup pre commit dependencies
	pip3 install -r requirements/integration.txt
	pre-commit install

format: py-format js-format

py-format: pre-commit
	pre-commit run black --all-files

py-lint: pre-commit
	pylint -j 0 bridge

js-format:
	cd bridge-frontend; npm run prettier

flask-app:
	flask run -p 8088 --with-threads --reload --debugger

node-app:
	cd bridge-frontend; npm run dev-server

build-cypress:
	cd bridge-frontend; npm run build-instrumented
	cd bridge-frontend/cypress-base; npm ci

open-cypress:
	if ! [ $(port) ]; then cd bridge-frontend/cypress-base; CYPRESS_BASE_URL=http://localhost:9000 npm run cypress open; fi
	cd bridge-frontend/cypress-base; CYPRESS_BASE_URL=http://localhost:$(port) npm run cypress open

report-celery-worker:
	celery --app=bridge.tasks.celery_app:app worker

report-celery-beat:
	celery --app=bridge.tasks.celery_app:app beat --pidfile /tmp/celerybeat.pid --schedule /tmp/celerybeat-schedulecd

admin-user:
	bridge fab create-admin
