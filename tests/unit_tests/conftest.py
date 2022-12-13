# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
# pylint: disable=redefined-outer-name, import-outside-toplevel

import importlib
import os
import unittest.mock
from typing import Any, Callable, Iterator

import pytest
from _pytest.fixtures import SubRequest
from pytest_mock import MockFixture
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.session import Session

from bridge import security_manager
from bridge.app import BridgeApp
from bridge.common.chart_data import ChartDataResultType
from bridge.common.query_object_factory import QueryObjectFactory
from bridge.extensions import appbuilder
from bridge.initialization import BridgeAppInitializer


@pytest.fixture
def get_session(mocker: MockFixture) -> Callable[[], Session]:
    """
    Create an in-memory SQLite session to test models.
    """
    engine = create_engine("sqlite://")

    def get_session():
        Session_ = sessionmaker(bind=engine)  # pylint: disable=invalid-name
        in_memory_session = Session_()

        # flask calls session.remove()
        in_memory_session.remove = lambda: None

        # patch session
        get_session = mocker.patch(
            "bridge.security.BridgeSecurityManager.get_session",
        )
        get_session.return_value = in_memory_session
        # FAB calls get_session.get_bind() to get a handler to the engine
        get_session.get_bind.return_value = engine
        # Allow for queries on security manager
        get_session.query = in_memory_session.query

        mocker.patch("bridge.db.session", in_memory_session)
        return in_memory_session

    return get_session


@pytest.fixture
def session(get_session) -> Iterator[Session]:
    yield get_session()


@pytest.fixture(scope="module")
def app(request: SubRequest) -> Iterator[BridgeApp]:
    """
    A fixture that generates a Bridge app.
    """
    app = BridgeApp(__name__)

    app.config.from_object("bridge.config")
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        os.environ.get("BRIDGE__SQLALCHEMY_DATABASE_URI") or "sqlite://"
    )
    app.config["WTF_CSRF_ENABLED"] = False
    app.config["PREVENT_UNSAFE_DB_CONNECTIONS"] = False
    app.config["TESTING"] = True

    # loop over extra configs passed in by tests
    if request and hasattr(request, "param"):
        for key, val in request.param.items():
            app.config[key] = val

    # ``bridge.extensions.appbuilder`` is a singleton, and won't rebuild the
    # routes when this fixture is called multiple times; we need to clear the
    # registered views to ensure the initialization can happen more than once.
    appbuilder.baseviews = []

    app_initializer = BridgeAppInitializer(app)
    app_initializer.init_app()

    # reload base views to ensure error handlers are applied to the app
    with app.app_context():
        import bridge.views.base

        importlib.reload(bridge.views.base)

    yield app


@pytest.fixture
def client(app: BridgeApp) -> Any:
    with app.test_client() as client:
        yield client


@pytest.fixture(autouse=True)
def app_context(app: BridgeApp) -> Iterator[None]:
    """
    A fixture that yields and application context.
    """
    with app.app_context():
        yield


@pytest.fixture
def full_api_access(mocker: MockFixture) -> Iterator[None]:
    """
    Allow full access to the API.

    TODO (betodealmeida): we should replace this with user-fixtures, eg, ``admin`` or
    ``gamma``, so that we have granular access to the APIs.
    """
    mocker.patch(
        "flask_appbuilder.security.decorators.verify_jwt_in_request",
        return_value=True,
    )
    mocker.patch.object(security_manager, "has_access", return_value=True)
    mocker.patch.object(security_manager, "can_access_all_databases", return_value=True)

    yield


@pytest.fixture
def dummy_query_object(request, app_context):
    query_obj_marker = request.node.get_closest_marker("query_object")
    result_type_marker = request.node.get_closest_marker("result_type")

    if query_obj_marker is None:
        query_object = {}
    else:
        query_object = query_obj_marker.args[0]

    if result_type_marker is None:
        result_type = ChartDataResultType.FULL
    else:
        result_type = result_type_marker.args[0]

    yield QueryObjectFactory(
        app_configurations={
            "ROW_LIMIT": 100,
        },
        _datasource_dao=unittest.mock.Mock(),
        session_maker=unittest.mock.Mock(),
    ).create(parent_result_type=result_type, **query_object)
