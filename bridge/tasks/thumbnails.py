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

"""Utility functions used across Bridge"""

import logging
from typing import Optional

from flask import current_app

from bridge import security_manager, thumbnail_cache
from bridge.extensions import celery_app
from bridge.utils.celery import session_scope
from bridge.utils.screenshots import ChartScreenshot, DashboardScreenshot
from bridge.utils.webdriver import WindowSize

logger = logging.getLogger(__name__)


@celery_app.task(name="cache_chart_thumbnail", soft_time_limit=300)
def cache_chart_thumbnail(
    url: str,
    digest: str,
    force: bool = False,
    window_size: Optional[WindowSize] = None,
    thumb_size: Optional[WindowSize] = None,
) -> None:
    if not thumbnail_cache:
        logger.warning("No cache set, refusing to compute")
        return None
    logger.info("Caching chart: %s", url)
    screenshot = ChartScreenshot(url, digest)
    with session_scope(nullpool=True) as session:
        user = security_manager.get_user_by_username(
            current_app.config["THUMBNAIL_SELENIUM_USER"], session=session
        )
        screenshot.compute_and_cache(
            user=user,
            cache=thumbnail_cache,
            force=force,
            window_size=window_size,
            thumb_size=thumb_size,
        )
    return None


@celery_app.task(name="cache_dashboard_thumbnail", soft_time_limit=300)
def cache_dashboard_thumbnail(
    url: str, digest: str, force: bool = False, thumb_size: Optional[WindowSize] = None
) -> None:
    if not thumbnail_cache:
        logging.warning("No cache set, refusing to compute")
        return
    logger.info("Caching dashboard: %s", url)
    screenshot = DashboardScreenshot(url, digest)
    with session_scope(nullpool=True) as session:
        user = security_manager.get_user_by_username(
            current_app.config["THUMBNAIL_SELENIUM_USER"], session=session
        )
        screenshot.compute_and_cache(
            user=user,
            cache=thumbnail_cache,
            force=force,
            thumb_size=thumb_size,
        )
