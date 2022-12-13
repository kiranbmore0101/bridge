/* eslint-disable camelcase */
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
  BridgeClientClass,
  BridgeClientInterface,
  StrictJsonObject,
  JsonValue,
  JsonObject,
} from '../../../connection';

export type ParsedResponseType<T> = T extends 'text'
  ? string
  : T extends 'raw' | null
  ? Response
  : JsonValue;

/**
 * Runtime options when calling a Bridge API. Currently only allow overriding
 * BridgeClient instance.
 */
export interface BridgeApiRequestOptions {
  client?: BridgeClientInterface | BridgeClientClass;
}

/**
 * Bridge API error types.
 * Ref: https://github.com/kiranbmore0101/incubator-bridge/blob/318e5347bc6f88119725775baa4ab9a398a6f0b0/bridge/errors.py#L24
 *
 * TODO: migrate bridge-frontend/src/components/ErrorMessage/types.ts over
 */
export enum BridgeApiErrorType {
  // Generic unknown error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',

  // Frontend errors
  FRONTEND_CSRF_ERROR = 'FRONTEND_CSRF_ERROR',
  FRONTEND_NETWORK_ERROR = 'FRONTEND_NETWORK_ERROR',
  FRONTEND_TIMEOUT_ERROR = 'FRONTEND_TIMEOUT_ERROR',

  // DB Engine errors,
  GENERIC_DB_ENGINE_ERROR = 'GENERIC_DB_ENGINE_ERROR',

  // Viz errors,
  VIZ_GET_DF_ERROR = 'VIZ_GET_DF_ERROR',
  UNKNOWN_DATASOURCE_TYPE_ERROR = 'UNKNOWN_DATASOURCE_TYPE_ERROR',
  FAILED_FETCHING_DATASOURCE_INFO_ERROR = 'FAILED_FETCHING_DATASOURCE_INFO_ERROR',

  // Security access errors,
  TABLE_SECURITY_ACCESS_ERROR = 'TABLE_SECURITY_ACCESS_ERROR',
  DATASOURCE_SECURITY_ACCESS_ERROR = 'DATASOURCE_SECURITY_ACCESS_ERROR',
  MISSING_OWNERSHIP_ERROR = 'MISSING_OWNERSHIP_ERROR',
}

/**
 * API Error json response from the backend (or fetch API in the frontend).
 * See SIP-40 and SIP-41: https://github.com/kiranbmore0101/incubator-bridge/issues/9298
 */
export interface BridgeApiErrorPayload {
  message?: string; // error message via FlaskAppBuilder, e.g. `response_404(message=...)`
  error_type?: BridgeApiErrorType;
  level?: 'error' | 'warn' | 'info';
  extra?: StrictJsonObject;
  /**
   * Error message returned via `json_error_response`.
   * Ref https://github.com/kiranbmore0101/incubator-bridge/blob/8e23d4f369f35724b34b14def8a5a8bafb1d2ecb/bridge/views/base.py#L94
   */
  error?: string | BridgeApiErrorPayload;
  link?: string;
}

export interface BridgeApiMultiErrorsPayload {
  errors: BridgeApiErrorPayload[];
}

export class BridgeApiError extends Error {
  status?: number;

  statusText?: string;

  errorType: BridgeApiErrorType;

  extra: JsonObject;

  originalError?: Error | Response | JsonValue;

  constructor({
    status,
    statusText,
    message,
    link,
    extra,
    stack,
    error_type: errorType,
    originalError,
  }: Omit<BridgeApiErrorPayload, 'error'> & {
    status?: number;
    statusText?: string;
    message: string;
    stack?: Error['stack'];
    // original JavaScript error or backend JSON response captured
    originalError?: BridgeApiError['originalError'];
  }) {
    super(message);
    const originalErrorStack =
      stack ||
      (originalError instanceof Error ? originalError.stack : undefined);
    this.stack =
      originalErrorStack && this.stack
        ? [
            this.stack.split('\n')[0],
            ...originalErrorStack.split('\n').slice(1),
          ].join('\n')
        : this.stack;
    this.name = 'BridgeApiError';
    this.errorType = errorType || BridgeApiErrorType.UNKNOWN_ERROR;
    this.extra = extra || {};
    if (link) {
      this.extra.link = link;
    }
    this.status = status;
    this.statusText = statusText;
    this.originalError = originalError;
  }
}
