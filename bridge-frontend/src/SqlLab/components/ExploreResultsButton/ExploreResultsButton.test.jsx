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
import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow } from 'enzyme';
import sqlLabReducer from 'src/SqlLab/reducers/index';
import ExploreResultsButton from 'src/SqlLab/components/ExploreResultsButton';
import Button from 'src/components/Button';
import { bridgeTheme, ThemeProvider } from '@bridge-ui/core';

describe('ExploreResultsButton', () => {
  const middlewares = [thunk];
  const mockStore = configureStore(middlewares);
  const database = {
    allows_subquery: true,
  };
  const initialState = {
    sqlLab: {
      ...sqlLabReducer(undefined, {}),
    },
    common: {
      conf: { BRIDGE_WEBSERVER_TIMEOUT: 45 },
    },
  };
  const store = mockStore(initialState);
  const mockedProps = {
    database,
    onClick() {},
  };

  const getExploreResultsButtonWrapper = (props = mockedProps) =>
    shallow(
      <ThemeProvider theme={bridgeTheme}>
        <ExploreResultsButton store={store} {...props} />
      </ThemeProvider>,
    )
      .dive()
      .dive();

  it('renders with props', () => {
    expect(
      React.isValidElement(<ExploreResultsButton {...mockedProps} />),
    ).toBe(true);
  });

  it('renders a Button', () => {
    const wrapper = getExploreResultsButtonWrapper();
    expect(wrapper.find(Button)).toExist();
  });
});
