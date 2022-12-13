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
from __future__ import annotations

from typing import Any, TYPE_CHECKING

import simplejson as json
from flask import request
from flask_appbuilder import expose
from flask_appbuilder.api import rison
from flask_appbuilder.security.decorators import has_access_api

from bridge import db, event_logger
from bridge.charts.commands.exceptions import (
    TimeRangeAmbiguousError,
    TimeRangeParseFailError,
)
from bridge.legacy import update_time_range
from bridge.models.slice import Slice
from bridge.bridge_typing import FlaskResponse
from bridge.utils import core as utils
from bridge.utils.date_parser import get_since_until
from bridge.views.base import api, BaseBridgeView, handle_api_exception

if TYPE_CHECKING:
    from bridge.common.query_context_factory import QueryContextFactory

get_time_range_schema = {"type": "string"}


class Api(BaseBridgeView):
    query_context_factory = None

    @event_logger.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose("/v1/query/", methods=["POST"])
    def query(self) -> FlaskResponse:
        """
        Takes a query_obj constructed in the client and returns payload data response
        for the given query_obj.

        raises BridgeSecurityException: If the user cannot access the resource
        """
        query_context = self.get_query_context_factory().create(
            **json.loads(request.form["query_context"])
        )
        query_context.raise_for_access()
        result = query_context.get_payload()
        payload_json = result["queries"]
        return json.dumps(
            payload_json, default=utils.json_int_dttm_ser, ignore_nan=True
        )

    @event_logger.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose("/v1/form_data/", methods=["GET"])
    def query_form_data(self) -> FlaskResponse:  # pylint: disable=no-self-use
        """
        Get the formdata stored in the database for existing slice.
        params: slice_id: integer
        """
        form_data = {}
        slice_id = request.args.get("slice_id")
        if slice_id:
            slc = db.session.query(Slice).filter_by(id=slice_id).one_or_none()
            if slc:
                form_data = slc.form_data.copy()

        update_time_range(form_data)

        return json.dumps(form_data)

    @api
    @handle_api_exception
    @has_access_api
    @rison(get_time_range_schema)
    @expose("/v1/time_range/", methods=["GET"])
    def time_range(self, **kwargs: Any) -> FlaskResponse:
        """Get actually time range from human readable string or datetime expression"""
        time_range = kwargs["rison"]
        try:
            since, until = get_since_until(time_range)
            result = {
                "since": since.isoformat() if since else "",
                "until": until.isoformat() if until else "",
                "timeRange": time_range,
            }
            return self.json_response({"result": result})
        except (ValueError, TimeRangeParseFailError, TimeRangeAmbiguousError) as error:
            error_msg = {"message": f"Unexpected time range: {error}"}
            return self.json_response(error_msg, 400)

    def get_query_context_factory(self) -> QueryContextFactory:
        if self.query_context_factory is None:
            # pylint: disable=import-outside-toplevel
            from bridge.common.query_context_factory import QueryContextFactory

            self.query_context_factory = QueryContextFactory()
        return self.query_context_factory
