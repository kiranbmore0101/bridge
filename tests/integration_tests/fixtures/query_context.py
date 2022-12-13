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
from typing import Any, Dict, Optional

from tests.common.query_context_generator import QueryContextGenerator
from tests.integration_tests.base_tests import BridgeTestCase


class QueryContextGeneratorInteg(QueryContextGenerator):
    def get_table(self, name, id_, type_):
        return BridgeTestCase.get_table(name=name)


def get_query_context(
    query_name: str,
    add_postprocessing_operations: bool = False,
    add_time_offsets: bool = False,
    form_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Create a request payload for retrieving a QueryContext object via the
    `api/v1/chart/data` endpoint. By default returns a payload corresponding to one
    generated by the "Boy Name Cloud" chart in the examples.
    :param query_name: name of an example query, which is always in the format
           of `datasource_name[:test_case_name]`, where `:test_case_name` is optional.
    :param add_postprocessing_operations: Add post-processing operations to QueryObject
    :param add_time_offsets: Add time offsets to QueryObject(advanced analytics)
    :param form_data: chart metadata
    :return: Request payload
    """
    return QueryContextGeneratorInteg().generate(
        query_name=query_name,
        add_postprocessing_operations=add_postprocessing_operations,
        add_time_offsets=add_time_offsets,
        form_data=form_data,
    )
