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

## @bridge-ui/demo

[![Version](https://img.shields.io/npm/v/@bridge-ui/demo.svg?style=flat)](https://www.npmjs.com/package/@bridge-ui/demo)
[![David (path)](https://img.shields.io/david/apache-bridge/bridge-ui.svg?path=packages%2Fbridge-ui-demo&style=flat-square)](https://david-dm.org/apache-bridge/bridge-ui?path=packages/bridge-ui-demo)

Storybook of `@bridge-ui` packages. See it live at
[apache-bridge.github.io/bridge-ui](https://apache-bridge.github.io/bridge-ui)

### Development

#### Run storybook

To view the storybook locally, you should first run `npm ci && npm run bootstrap` in the
`@bridge-ui` monorepo root directory, which will install all dependencies for this package and
sym-link any `@bridge-ui` packages to your local system.

After that run `npm run storybook` which will open up a dev server at http://localhost:9001.

#### Adding new stories

###### Existing package

If stories already exist for the package you are adding, simply extend the `examples` already
exported for that package in the `storybook/stories/<package>/index.js` file.

###### New package

If you are creating stories for a package that doesn't yet have any stories, follow these steps:

1. Add any new package dependencies (including any `@bridge-ui/*` packages) via
   `npm install <package>`.

2. Create a new folder that mirrors the package name

   > e.g., `mkdir storybook/stories/bridge-ui-color/`

3. Add an `index.js` file to that folder with a default export with the following shape:

> you can use the `|` separator within the `storyPath` string to denote _nested_ stories e.g.,
> `storyPath: '@bridge-ui/package|Nested i|Nested ii'`

```javascript
 default export {
   examples: [
     {
       storyPath: <string>,
       storyName: <string>,
       renderStory: <func> () => node,
     },
     ...
   ]
 };
```
