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
from typing import cast, Optional

from flask import session

from bridge.dashboards.filter_state.commands.utils import check_access
from bridge.extensions import cache_manager
from bridge.key_value.utils import random_key
from bridge.temporary_cache.commands.entry import Entry
from bridge.temporary_cache.commands.exceptions import TemporaryCacheAccessDeniedError
from bridge.temporary_cache.commands.parameters import CommandParameters
from bridge.temporary_cache.commands.update import UpdateTemporaryCacheCommand
from bridge.temporary_cache.utils import cache_key
from bridge.utils.core import get_user_id


class UpdateFilterStateCommand(UpdateTemporaryCacheCommand):
    def update(self, cmd_params: CommandParameters) -> Optional[str]:
        resource_id = cmd_params.resource_id
        key = cmd_params.key
        value = cast(str, cmd_params.value)  # schema ensures that value is not optional
        check_access(resource_id)
        entry: Entry = cache_manager.filter_state_cache.get(cache_key(resource_id, key))
        owner = get_user_id()
        if entry:
            if entry["owner"] != owner:
                raise TemporaryCacheAccessDeniedError()

            # Generate a new key if tab_id changes or equals 0
            contextual_key = cache_key(
                session.get("_id"), cmd_params.tab_id, resource_id
            )
            key = cache_manager.filter_state_cache.get(contextual_key)
            if not key or not cmd_params.tab_id:
                key = random_key()
                cache_manager.filter_state_cache.set(contextual_key, key)

            new_entry: Entry = {"owner": owner, "value": value}
            cache_manager.filter_state_cache.set(cache_key(resource_id, key), new_entry)
        return key
