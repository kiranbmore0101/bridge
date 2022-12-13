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

import { Dispatch, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { Dataset } from '@bridge-ui/chart-controls';
import { BridgeClient } from '@bridge-ui/core';
import { addDangerToast } from 'src/components/MessageToasts/actions';
import { getClientErrorObject } from 'src/utils/getClientErrorObject';
import { updateFormDataByDatasource } from './exploreActions';
import { ExplorePageState } from '../types';

export const SET_DATASOURCE = 'SET_DATASOURCE';
export interface SetDatasource {
  type: string;
  datasource: Dataset;
}
export function setDatasource(datasource: Dataset) {
  return { type: SET_DATASOURCE, datasource };
}

export function saveDataset({
  schema,
  sql,
  database,
  templateParams,
  datasourceName,
  columns,
}: Omit<SqlLabPostRequest['data'], 'dbId'> & { database: { id: number } }) {
  return async function (dispatch: ThunkDispatch<any, undefined, AnyAction>) {
    // Create a dataset object
    try {
      const {
        json: { data },
      } = await BridgeClient.post({
        endpoint: '/bridge/sqllab_viz/',
        postPayload: {
          data: {
            schema,
            sql,
            dbId: database?.id,
            templateParams,
            datasourceName,
            metrics: [],
            columns,
          },
        },
      });
      // Update form_data to point to new dataset
      dispatch(changeDatasource(data));
      return data;
    } catch (error) {
      getClientErrorObject(error).then(e => {
        dispatch(addDangerToast(e.error));
      });
      throw error;
    }
  };
}

export function changeDatasource(newDatasource: Dataset) {
  return function (dispatch: Dispatch, getState: () => ExplorePageState) {
    const {
      explore: { datasource: prevDatasource },
    } = getState();
    dispatch(setDatasource(newDatasource));
    dispatch(updateFormDataByDatasource(prevDatasource, newDatasource));
  };
}

export const datasourcesActions = {
  setDatasource,
  changeDatasource,
  saveDataset,
};

export type AnyDatasourcesAction = SetDatasource;
