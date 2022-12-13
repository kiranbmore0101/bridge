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
from typing import Optional

from flask_appbuilder.models.sqla import Model

from bridge import security_manager
from bridge.commands.base import BaseCommand
from bridge.dao.exceptions import DAODeleteFailedError
from bridge.exceptions import BridgeSecurityException
from bridge.reports.commands.exceptions import (
    ReportScheduleDeleteFailedError,
    ReportScheduleForbiddenError,
    ReportScheduleNotFoundError,
)
from bridge.reports.dao import ReportScheduleDAO
from bridge.reports.models import ReportSchedule

logger = logging.getLogger(__name__)


class DeleteReportScheduleCommand(BaseCommand):
    def __init__(self, model_id: int):
        self._model_id = model_id
        self._model: Optional[ReportSchedule] = None

    def run(self) -> Model:
        self.validate()
        try:
            report_schedule = ReportScheduleDAO.delete(self._model)
        except DAODeleteFailedError as ex:
            logger.exception(ex.exception)
            raise ReportScheduleDeleteFailedError() from ex
        return report_schedule

    def validate(self) -> None:
        # Validate/populate model exists
        self._model = ReportScheduleDAO.find_by_id(self._model_id)
        if not self._model:
            raise ReportScheduleNotFoundError()

        # Check ownership
        try:
            security_manager.raise_for_ownership(self._model)
        except BridgeSecurityException as ex:
            raise ReportScheduleForbiddenError() from ex