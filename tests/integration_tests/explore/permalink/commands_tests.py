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

import json
from unittest.mock import patch

import pytest

from bridge import app, db, security, security_manager
from bridge.commands.exceptions import DatasourceTypeInvalidError
from bridge.connectors.sqla.models import SqlaTable
from bridge.explore.form_data.commands.parameters import CommandParameters
from bridge.explore.permalink.commands.create import CreateExplorePermalinkCommand
from bridge.explore.permalink.commands.get import GetExplorePermalinkCommand
from bridge.key_value.utils import decode_permalink_id
from bridge.models.slice import Slice
from bridge.models.sql_lab import Query
from bridge.utils.core import DatasourceType, get_example_default_schema
from bridge.utils.database import get_example_database
from tests.integration_tests.base_tests import BridgeTestCase


class TestCreatePermalinkDataCommand(BridgeTestCase):
    @pytest.fixture()
    def create_dataset(self):
        with self.create_app().app_context():
            dataset = SqlaTable(
                table_name="dummy_sql_table",
                database=get_example_database(),
                schema=get_example_default_schema(),
                sql="select 123 as intcol, 'abc' as strcol",
            )
            session = db.session
            session.add(dataset)
            session.commit()

            yield dataset

            # rollback
            session.delete(dataset)
            session.commit()

    @pytest.fixture()
    def create_slice(self):
        with self.create_app().app_context():
            session = db.session
            dataset = (
                session.query(SqlaTable).filter_by(table_name="dummy_sql_table").first()
            )
            slice = Slice(
                datasource_id=dataset.id,
                datasource_type=DatasourceType.TABLE,
                datasource_name="tmp_perm_table",
                slice_name="slice_name",
            )

            session.add(slice)
            session.commit()

            yield slice

            # rollback
            session.delete(slice)
            session.commit()

    @pytest.fixture()
    def create_query(self):
        with self.create_app().app_context():
            session = db.session

            query = Query(
                sql="select 1 as foo;",
                client_id="sldkfjlk",
                database=get_example_database(),
            )

            session.add(query)
            session.commit()

            yield query

            # rollback
            session.delete(query)
            session.commit()

    @patch("bridge.security.manager.g")
    @pytest.mark.usefixtures("create_dataset", "create_slice")
    def test_create_permalink_command(self, mock_g):
        mock_g.user = security_manager.find_user("admin")

        dataset = (
            db.session.query(SqlaTable).filter_by(table_name="dummy_sql_table").first()
        )
        slice = db.session.query(Slice).filter_by(slice_name="slice_name").first()

        datasource = f"{dataset.id}__{DatasourceType.TABLE}"
        command = CreateExplorePermalinkCommand(
            {"formData": {"datasource": datasource, "slice_id": slice.id}}
        )

        assert isinstance(command.run(), str)

    @patch("bridge.security.manager.g")
    @pytest.mark.usefixtures("create_dataset", "create_slice")
    def test_get_permalink_command(self, mock_g):
        mock_g.user = security_manager.find_user("admin")
        app.config["EXPLORE_FORM_DATA_CACHE_CONFIG"] = {
            "REFRESH_TIMEOUT_ON_RETRIEVAL": True
        }

        dataset = (
            db.session.query(SqlaTable).filter_by(table_name="dummy_sql_table").first()
        )
        slice = db.session.query(Slice).filter_by(slice_name="slice_name").first()

        datasource = f"{dataset.id}__{DatasourceType.TABLE}"

        key = CreateExplorePermalinkCommand(
            {"formData": {"datasource": datasource, "slice_id": slice.id}}
        ).run()

        get_command = GetExplorePermalinkCommand(key)
        cache_data = get_command.run()

        assert cache_data.get("datasource") == datasource

    @patch("bridge.security.manager.g")
    @patch("bridge.key_value.commands.get.GetKeyValueCommand.run")
    @patch("bridge.explore.permalink.commands.get.decode_permalink_id")
    @pytest.mark.usefixtures("create_dataset", "create_slice")
    def test_get_permalink_command_with_old_dataset_key(
        self, decode_id_mock, get_kv_command_mock, mock_g
    ):
        mock_g.user = security_manager.find_user("admin")
        app.config["EXPLORE_FORM_DATA_CACHE_CONFIG"] = {
            "REFRESH_TIMEOUT_ON_RETRIEVAL": True
        }

        dataset = (
            db.session.query(SqlaTable).filter_by(table_name="dummy_sql_table").first()
        )
        slice = db.session.query(Slice).filter_by(slice_name="slice_name").first()

        datasource_string = f"{dataset.id}__{DatasourceType.TABLE}"

        decode_id_mock.return_value = "123456"
        get_kv_command_mock.return_value = {
            "chartId": slice.id,
            "datasetId": dataset.id,
            "datasource": datasource_string,
            "state": {
                "formData": {"datasource": datasource_string, "slice_id": slice.id}
            },
        }
        get_command = GetExplorePermalinkCommand("thisisallmocked")
        cache_data = get_command.run()

        assert cache_data.get("datasource") == datasource_string
