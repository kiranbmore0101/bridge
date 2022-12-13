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
import fetchMock from 'fetch-mock';

import { BridgeClient, BridgeClientClass } from '@bridge-ui/core';
import { LOGIN_GLOB } from './fixtures/constants';

describe('BridgeClient', () => {
  beforeAll(() => {
    fetchMock.get(LOGIN_GLOB, { result: '' });
  });

  afterAll(fetchMock.restore);

  afterEach(BridgeClient.reset);

  it('exposes reset, configure, init, get, post, postForm, isAuthenticated, and reAuthenticate methods', () => {
    expect(typeof BridgeClient.configure).toBe('function');
    expect(typeof BridgeClient.init).toBe('function');
    expect(typeof BridgeClient.get).toBe('function');
    expect(typeof BridgeClient.post).toBe('function');
    expect(typeof BridgeClient.postForm).toBe('function');
    expect(typeof BridgeClient.isAuthenticated).toBe('function');
    expect(typeof BridgeClient.reAuthenticate).toBe('function');
    expect(typeof BridgeClient.getGuestToken).toBe('function');
    expect(typeof BridgeClient.request).toBe('function');
    expect(typeof BridgeClient.reset).toBe('function');
  });

  it('throws if you call init, get, post, postForm, isAuthenticated, or reAuthenticate before configure', () => {
    expect(BridgeClient.init).toThrow();
    expect(BridgeClient.get).toThrow();
    expect(BridgeClient.post).toThrow();
    expect(BridgeClient.postForm).toThrow();
    expect(BridgeClient.isAuthenticated).toThrow();
    expect(BridgeClient.reAuthenticate).toThrow();
    expect(BridgeClient.request).toThrow();
    expect(BridgeClient.configure).not.toThrow();
  });

  // this also tests that the ^above doesn't throw if configure is called appropriately
  it('calls appropriate BridgeClient methods when configured', async () => {
    expect.assertions(16);
    const mockGetUrl = '/mock/get/url';
    const mockPostUrl = '/mock/post/url';
    const mockRequestUrl = '/mock/request/url';
    const mockPutUrl = '/mock/put/url';
    const mockDeleteUrl = '/mock/delete/url';
    const mockGetPayload = { get: 'payload' };
    const mockPostPayload = { post: 'payload' };
    const mockDeletePayload = { delete: 'ok' };
    const mockPutPayload = { put: 'ok' };
    fetchMock.get(mockGetUrl, mockGetPayload);
    fetchMock.post(mockPostUrl, mockPostPayload);
    fetchMock.delete(mockDeleteUrl, mockDeletePayload);
    fetchMock.put(mockPutUrl, mockPutPayload);
    fetchMock.get(mockRequestUrl, mockGetPayload);

    const initSpy = jest.spyOn(BridgeClientClass.prototype, 'init');
    const getSpy = jest.spyOn(BridgeClientClass.prototype, 'get');
    const postSpy = jest.spyOn(BridgeClientClass.prototype, 'post');
    const putSpy = jest.spyOn(BridgeClientClass.prototype, 'put');
    const deleteSpy = jest.spyOn(BridgeClientClass.prototype, 'delete');
    const authenticatedSpy = jest.spyOn(
      BridgeClientClass.prototype,
      'isAuthenticated',
    );
    const csrfSpy = jest.spyOn(BridgeClientClass.prototype, 'getCSRFToken');
    const requestSpy = jest.spyOn(BridgeClientClass.prototype, 'request');
    const getGuestTokenSpy = jest.spyOn(
      BridgeClientClass.prototype,
      'getGuestToken',
    );

    BridgeClient.configure({});
    await BridgeClient.init();

    expect(initSpy).toHaveBeenCalledTimes(1);
    expect(authenticatedSpy).toHaveBeenCalledTimes(2);
    expect(csrfSpy).toHaveBeenCalledTimes(1);

    await BridgeClient.get({ url: mockGetUrl });
    await BridgeClient.post({ url: mockPostUrl });
    await BridgeClient.delete({ url: mockDeleteUrl });
    await BridgeClient.put({ url: mockPutUrl });
    await BridgeClient.request({ url: mockRequestUrl });

    // Make sure network calls have  Accept: 'application/json' in headers
    const networkCalls = [
      mockGetUrl,
      mockPostUrl,
      mockRequestUrl,
      mockPutUrl,
      mockDeleteUrl,
    ];
    networkCalls.map((url: string) =>
      expect(fetchMock.calls(url)[0][1]?.headers).toStrictEqual({
        Accept: 'application/json',
        'X-CSRFToken': '',
      }),
    );

    BridgeClient.isAuthenticated();
    await BridgeClient.reAuthenticate();

    BridgeClient.getGuestToken();
    expect(getGuestTokenSpy).toHaveBeenCalledTimes(1);

    expect(initSpy).toHaveBeenCalledTimes(2);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy).toHaveBeenCalledTimes(5); // request rewires to get
    expect(csrfSpy).toHaveBeenCalledTimes(2); // from init() + reAuthenticate()

    initSpy.mockRestore();
    getSpy.mockRestore();
    putSpy.mockRestore();
    deleteSpy.mockRestore();
    requestSpy.mockRestore();
    postSpy.mockRestore();
    authenticatedSpy.mockRestore();
    csrfSpy.mockRestore();

    fetchMock.reset();
  });
});
