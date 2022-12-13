<!--
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
-->

## @bridge-ui/core/connection

Connection modules for Bridge:

- `BridgeClient` requests and authentication
- (future) `i18n` locales and translation

### BridgeClient

The `BridgeClient` handles all client-side requests to the Bridge backend. It can be configured
for use within the Bridge application, or used to issue `CORS` requests in other applications. At
a high-level it supports:

- `CSRF` token authentication
  - a token may be passed at configuration time, else the client will handle fetching and passing
    the token in all subsequent requests.
  - queues requests in the case that another request is made before the token is received.
  - it checks for a token before every request, and will fail if no token was received or if it has
    expired. In either case the user should be directed to re-authenticate.
- supports `GET` and `POST` requests (no `PUT` or `DELETE`)
- timeouts
- query aborts through the `AbortController` API
- conditional `GET` requests using `If-None-Match` and `ETag` headers

#### Example usage

```javascript
// appSetup.js
import { BridgeClient } from `@bridge-ui/core`;

BridgeClient.configure(...clientConfig);
BridgeClient.init(); // CSRF auth, can also chain `.configure().init();

// anotherFile.js
import { BridgeClient } from `@bridge-ui/core`;

BridgeClient.post(...requestConfig)
  .then(({ request, json }) => ...)
  .catch((error) => ...);
```

#### API

##### Client Configuration

The following flags can be passed in the client config call
`BridgeClient.configure(...clientConfig);`

- `protocol = 'http:'`
- `host`
- `headers`
- `credentials = 'same-origin'` (set to `include` for non-Bridge apps)
- `mode = 'same-origin'` (set to `cors` for non-Bridge apps)
- `timeout`
- `csrfToken` you can configure the client with a CSRF token at configuration time, else the client
  will attempt to fetch this before any other requests are issued

##### Per-request Configuration

The following flags can be passed on a per-request call `BridgeClient.get/post(...requestConfig);`

- `url` or `endpoint`
- `headers`
- `body`
- `timeout`
- `signal` (for aborting, from `const { signal } = (new AbortController())`)
- for `POST` requests
  - `postPayload` (key values are added to a `new FormData()`)
  - `stringify` whether to call `JSON.stringify` on `postPayload` values

##### Request aborting

Per-request aborting is implemented through the `AbortController` API:

```javascript
import { BridgeClient } from '@bridge-ui/core';
import AbortController from 'abortcontroller-polyfill';

const controller = new AbortController();
const { signal } = controller;

BridgeClient.get({ ..., signal }).then(...).catch(...);

if (IWantToCancelForSomeReason) {
  signal.abort(); // Promise is rejected, request `catch` is invoked
}
```
