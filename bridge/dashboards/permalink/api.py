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
import logging

from flask import request, Response
from flask_appbuilder.api import BaseApi, expose, protect, safe
from marshmallow import ValidationError

from bridge.constants import MODEL_API_RW_METHOD_PERMISSION_MAP, RouteMethod
from bridge.dashboards.commands.exceptions import (
    DashboardAccessDeniedError,
    DashboardNotFoundError,
)
from bridge.dashboards.permalink.commands.create import (
    CreateDashboardPermalinkCommand,
)
from bridge.dashboards.permalink.commands.get import GetDashboardPermalinkCommand
from bridge.dashboards.permalink.exceptions import DashboardPermalinkInvalidStateError
from bridge.dashboards.permalink.schemas import DashboardPermalinkPostSchema
from bridge.extensions import event_logger
from bridge.key_value.exceptions import KeyValueAccessDeniedError
from bridge.views.base_api import requires_json

logger = logging.getLogger(__name__)


class DashboardPermalinkRestApi(BaseApi):
    add_model_schema = DashboardPermalinkPostSchema()
    method_permission_name = MODEL_API_RW_METHOD_PERMISSION_MAP
    include_route_methods = {
        RouteMethod.POST,
        RouteMethod.PUT,
        RouteMethod.GET,
        RouteMethod.DELETE,
    }
    allow_browser_login = True
    class_permission_name = "DashboardPermalinkRestApi"
    resource_name = "dashboard"
    openapi_spec_tag = "Dashboard Permanent Link"
    openapi_spec_component_schemas = (DashboardPermalinkPostSchema,)

    @expose("/<pk>/permalink", methods=["POST"])
    @protect()
    @safe
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.post",
        log_to_statsd=False,
    )
    @requires_json
    def post(self, pk: str) -> Response:
        """Stores a new permanent link.
        ---
        post:
          description: >-
            Stores a new permanent link.
          parameters:
          - in: path
            schema:
              type: string
            name: pk
          requestBody:
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/DashboardPermalinkPostSchema'
          responses:
            201:
              description: The permanent link was stored successfully.
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      key:
                        type: string
                        description: The key to retrieve the permanent link data.
                      url:
                        type: string
                        description: permanent link.
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            422:
              $ref: '#/components/responses/422'
            500:
              $ref: '#/components/responses/500'
        """
        try:
            state = self.add_model_schema.load(request.json)
            key = CreateDashboardPermalinkCommand(
                dashboard_id=pk,
                state=state,
            ).run()
            http_origin = request.headers.environ.get("HTTP_ORIGIN")
            url = f"{http_origin}/bridge/dashboard/p/{key}/"
            return self.response(201, key=key, url=url)
        except (ValidationError, DashboardPermalinkInvalidStateError) as ex:
            return self.response(400, message=str(ex))
        except (
            DashboardAccessDeniedError,
            KeyValueAccessDeniedError,
        ) as ex:
            return self.response(403, message=str(ex))
        except DashboardNotFoundError as ex:
            return self.response(404, message=str(ex))

    @expose("/permalink/<string:key>", methods=["GET"])
    @protect()
    @safe
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.get",
        log_to_statsd=False,
    )
    def get(self, key: str) -> Response:
        """Retrives permanent link state for dashboard.
        ---
        get:
          description: >-
            Retrives dashboard state associated with a permanent link.
          parameters:
          - in: path
            schema:
              type: string
            name: key
          responses:
            200:
              description: Returns the stored state.
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      state:
                        type: object
                        description: The stored state
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            404:
              $ref: '#/components/responses/404'
            422:
              $ref: '#/components/responses/422'
            500:
              $ref: '#/components/responses/500'
        """
        try:
            value = GetDashboardPermalinkCommand(key=key).run()
            if not value:
                return self.response_404()
            return self.response(200, **value)
        except DashboardAccessDeniedError as ex:
            return self.response(403, message=str(ex))
        except DashboardNotFoundError as ex:
            return self.response(404, message=str(ex))