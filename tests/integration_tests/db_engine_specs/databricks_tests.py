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
from textwrap import dedent
from unittest import mock

from sqlalchemy import column, literal_column

from bridge.constants import USER_AGENT
from bridge.db_engine_specs import get_engine_spec
from bridge.db_engine_specs.databricks import DatabricksNativeEngineSpec
from tests.integration_tests.db_engine_specs.base_tests import (
    assert_generic_types,
    TestDbEngineSpec,
)
from tests.integration_tests.fixtures.certificates import ssl_certificate
from tests.integration_tests.fixtures.database import default_db_extra


class TestDatabricksDbEngineSpec(TestDbEngineSpec):
    def test_get_engine_spec(self):
        """
        DB Eng Specs (databricks): Test "databricks" in engine spec
        """
        assert get_engine_spec("databricks", "connector").engine == "databricks"
        assert get_engine_spec("databricks", "pyodbc").engine == "databricks"
        assert get_engine_spec("databricks", "pyhive").engine == "databricks"

    def test_extras_without_ssl(self):
        db = mock.Mock()
        db.extra = default_db_extra
        db.server_cert = None
        extras = DatabricksNativeEngineSpec.get_extra_params(db)
        assert "connect_args" not in extras["engine_params"]

    def test_extras_with_user_agent(self):
        db = mock.Mock()
        db.extra = default_db_extra
        extras = DatabricksNativeEngineSpec.get_extra_params(db)
        _, user_agent = extras["http_headers"][0]
        user_agent_entry = extras["_user_agent_entry"]
        assert user_agent == USER_AGENT
        assert user_agent_entry == USER_AGENT

    def test_extras_with_ssl_custom(self):
        db = mock.Mock()
        db.extra = default_db_extra.replace(
            '"engine_params": {}',
            '"engine_params": {"connect_args": {"ssl": "1"}}',
        )
        db.server_cert = ssl_certificate
        extras = DatabricksNativeEngineSpec.get_extra_params(db)
        connect_args = extras["engine_params"]["connect_args"]
        assert connect_args["ssl"] == "1"
