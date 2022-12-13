/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  ControlPanelsContainerProps,
  ControlSetItem,
  ControlSetRow,
} from '@bridge-ui/chart-controls';
import { FeatureFlag, isFeatureEnabled, t } from '@bridge-ui/core';
import { PAGE_SIZE_OPTIONS } from '../../consts';

export const serverPaginationControlSetRow: ControlSetRow =
  isFeatureEnabled(FeatureFlag.DASHBOARD_CROSS_FILTERS) ||
  isFeatureEnabled(FeatureFlag.DASHBOARD_NATIVE_FILTERS)
    ? [
        {
          name: 'server_pagination',
          config: {
            type: 'CheckboxControl',
            label: t('Server pagination'),
            description: t(
              'Enable server side pagination of results (experimental feature)',
            ),
            default: false,
          },
        },
      ]
    : [];

export const serverPageLengthControlSetItem: ControlSetItem = {
  name: 'server_page_length',
  config: {
    type: 'SelectControl',
    freeForm: true,
    label: t('Server Page Length'),
    default: 10,
    choices: PAGE_SIZE_OPTIONS,
    description: t('Rows per page, 0 means no pagination'),
    visibility: ({ controls }: ControlPanelsContainerProps) =>
      Boolean(controls?.server_pagination?.value),
  },
};
