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

# bridge

![Version: 0.7.7](https://img.shields.io/badge/Version-0.7.7-informational?style=flat-square)

Apache Bridge is a modern, enterprise-ready business intelligence web application

**Homepage:** <https://bridge.apache.org/>

## Source Code

* <https://github.com/kiranbmore0101/bridge>

## TL;DR

```console
helm repo add bridge http://apache.github.io/bridge/
helm install my-bridge bridge/bridge
```

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://charts.bitnami.com/bitnami | postgresql | 11.1.22 |
| https://charts.bitnami.com/bitnami | redis | 16.3.1 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` |  |
| bootstrapScript | string | see `values.yaml` | Install additional packages and do any other bootstrap configuration in this script For production clusters it's recommended to build own image with this step done in CI |
| configFromSecret | string | `"{{ template \"bridge.fullname\" . }}-config"` | The name of the secret which we will use to generate a bridge_config.py file Note: this secret must have the key bridge_config.py in it and can include other files as well |
| configMountPath | string | `"/app/pythonpath"` |  |
| configOverrides | object | `{}` | A dictionary of overrides to append at the end of bridge_config.py - the name does not matter WARNING: the order is not guaranteed Files can be passed as helm --set-file configOverrides.my-override=my-file.py |
| configOverridesFiles | object | `{}` | Same as above but the values are files |
| envFromSecret | string | `"{{ template \"bridge.fullname\" . }}-env"` | The name of the secret which we will use to populate env vars in deployed pods This can be useful for secret keys, etc. |
| envFromSecrets | list | `[]` | This can be a list of templated strings |
| extraConfigMountPath | string | `"/app/configs"` |  |
| extraConfigs | object | `{}` | Extra files to mount on `/app/pythonpath` |
| extraEnv | object | `{}` | Extra environment variables that will be passed into pods |
| extraEnvRaw | list | `[]` | Extra environment variables in RAW format that will be passed into pods |
| extraSecretEnv | object | `{}` | Extra environment variables to pass as secrets |
| extraSecrets | object | `{}` | Extra files to mount on `/app/pythonpath` as secrets |
| extraVolumeMounts | list | `[]` |  |
| extraVolumes | list | `[]` |  |
| hostAliases | list | `[]` | Custom hostAliases for all bridge pods # https://kubernetes.io/docs/tasks/network/customize-hosts-file-for-pods/ |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"kiranbmore0101/bridge"` |  |
| image.tag | string | `"latest"` |  |
| imagePullSecrets | list | `[]` |  |
| ingress.annotations | object | `{}` |  |
| ingress.enabled | bool | `false` |  |
| ingress.hosts[0] | string | `"chart-example.local"` |  |
| ingress.path | string | `"/"` |  |
| ingress.pathType | string | `"ImplementationSpecific"` |  |
| ingress.tls | list | `[]` |  |
| init.adminUser.email | string | `"admin@bridge.com"` |  |
| init.adminUser.firstname | string | `"Bridge"` |  |
| init.adminUser.lastname | string | `"Admin"` |  |
| init.adminUser.password | string | `"admin"` |  |
| init.adminUser.username | string | `"admin"` |  |
| init.command | list | a `bridge_init.sh` command | Command |
| init.containerSecurityContext | object | `{}` |  |
| init.createAdmin | bool | `true` |  |
| init.enabled | bool | `true` |  |
| init.initContainers | list | a container waiting for postgres | List of initContainers |
| init.initscript | string | a script to create admin user and initailize roles | A Bridge init script |
| init.loadExamples | bool | `false` |  |
| init.podAnnotations | object | `{}` |  |
| init.podSecurityContext | object | `{}` |  |
| init.resources | object | `{}` |  |
| initImage.pullPolicy | string | `"IfNotPresent"` |  |
| initImage.repository | string | `"jwilder/dockerize"` |  |
| initImage.tag | string | `"latest"` |  |
| nodeSelector | object | `{}` |  |
| postgresql | object | see `values.yaml` | Configuration values for the postgresql dependency. ref: https://github.com/kubernetes/charts/blob/master/stable/postgresql/README.md |
| redis | object | see `values.yaml` | Configuration values for the Redis dependency. ref: https://github.com/bitnami/charts/blob/master/bitnami/redis More documentation can be found here: https://artifacthub.io/packages/helm/bitnami/redis |
| resources | object | `{}` |  |
| runAsUser | int | `0` | User ID directive. This user must have enough permissions to run the bootstrap script Running containers as root is not recommended in production. Change this to another UID - e.g. 1000 to be more secure |
| service.annotations | object | `{}` |  |
| service.loadBalancerIP | string | `nil` |  |
| service.port | int | `8088` |  |
| service.type | string | `"ClusterIP"` |  |
| serviceAccount.annotations | object | `{}` |  |
| serviceAccount.create | bool | `false` | Create custom service account for Bridge. If create: true and name is not provided, `bridge.fullname` will be used. |
| bridgeCeleryBeat.command | list | a `celery beat` command | Command |
| bridgeCeleryBeat.containerSecurityContext | object | `{}` |  |
| bridgeCeleryBeat.deploymentAnnotations | object | `{}` | Annotations to be added to bridgeCeleryBeat deployment |
| bridgeCeleryBeat.enabled | bool | `false` | This is only required if you intend to use alerts and reports |
| bridgeCeleryBeat.forceReload | bool | `false` | If true, forces deployment to reload on each upgrade |
| bridgeCeleryBeat.initContainers | list | a container waiting for postgres | List of init containers |
| bridgeCeleryBeat.podAnnotations | object | `{}` | Annotations to be added to bridgeCeleryBeat pods |
| bridgeCeleryBeat.podLabels | object | `{}` | Labels to be added to bridgeCeleryBeat pods |
| bridgeCeleryBeat.podSecurityContext | object | `{}` |  |
| bridgeCeleryBeat.resources | object | `{}` | Resource settings for the CeleryBeat pods - these settings overwrite might existing values from the global resources object defined above. |
| bridgeCeleryFlower.command | list | a `celery flower` command | Command |
| bridgeCeleryFlower.containerSecurityContext | object | `{}` |  |
| bridgeCeleryFlower.deploymentAnnotations | object | `{}` | Annotations to be added to bridgeCeleryBeat deployment |
| bridgeCeleryFlower.enabled | bool | `false` | Enables a Celery flower deployment (management UI to monitor celery jobs) WARNING: on bridge 1.x, this requires a Bridge image that has `flower<1.0.0` installed (which is NOT the case of the default images) flower>=1.0.0 requires Celery 5+ which Bridge 1.5 does not support |
| bridgeCeleryFlower.initContainers | list | a container waiting for postgres and redis | List of init containers |
| bridgeCeleryFlower.livenessProbe.failureThreshold | int | `3` |  |
| bridgeCeleryFlower.livenessProbe.httpGet.path | string | `"/api/workers"` |  |
| bridgeCeleryFlower.livenessProbe.httpGet.port | string | `"flower"` |  |
| bridgeCeleryFlower.livenessProbe.initialDelaySeconds | int | `5` |  |
| bridgeCeleryFlower.livenessProbe.periodSeconds | int | `5` |  |
| bridgeCeleryFlower.livenessProbe.successThreshold | int | `1` |  |
| bridgeCeleryFlower.livenessProbe.timeoutSeconds | int | `1` |  |
| bridgeCeleryFlower.podAnnotations | object | `{}` | Annotations to be added to bridgeCeleryBeat pods |
| bridgeCeleryFlower.podLabels | object | `{}` | Labels to be added to bridgeCeleryBeat pods |
| bridgeCeleryFlower.podSecurityContext | object | `{}` |  |
| bridgeCeleryFlower.readinessProbe.failureThreshold | int | `3` |  |
| bridgeCeleryFlower.readinessProbe.httpGet.path | string | `"/api/workers"` |  |
| bridgeCeleryFlower.readinessProbe.httpGet.port | string | `"flower"` |  |
| bridgeCeleryFlower.readinessProbe.initialDelaySeconds | int | `5` |  |
| bridgeCeleryFlower.readinessProbe.periodSeconds | int | `5` |  |
| bridgeCeleryFlower.readinessProbe.successThreshold | int | `1` |  |
| bridgeCeleryFlower.readinessProbe.timeoutSeconds | int | `1` |  |
| bridgeCeleryFlower.replicaCount | int | `1` |  |
| bridgeCeleryFlower.resources | object | `{}` | Resource settings for the CeleryBeat pods - these settings overwrite might existing values from the global resources object defined above. |
| bridgeCeleryFlower.service.annotations | object | `{}` |  |
| bridgeCeleryFlower.service.port | int | `5555` |  |
| bridgeCeleryFlower.service.type | string | `"ClusterIP"` |  |
| bridgeCeleryFlower.startupProbe.failureThreshold | int | `60` |  |
| bridgeCeleryFlower.startupProbe.httpGet.path | string | `"/api/workers"` |  |
| bridgeCeleryFlower.startupProbe.httpGet.port | string | `"flower"` |  |
| bridgeCeleryFlower.startupProbe.initialDelaySeconds | int | `5` |  |
| bridgeCeleryFlower.startupProbe.periodSeconds | int | `5` |  |
| bridgeCeleryFlower.startupProbe.successThreshold | int | `1` |  |
| bridgeCeleryFlower.startupProbe.timeoutSeconds | int | `1` |  |
| bridgeNode.command | list | See `values.yaml` | Startup command |
| bridgeNode.connections.db_host | string | `"{{ template \"bridge.fullname\" . }}-postgresql"` |  |
| bridgeNode.connections.db_name | string | `"bridge"` |  |
| bridgeNode.connections.db_pass | string | `"bridge"` |  |
| bridgeNode.connections.db_port | string | `"5432"` |  |
| bridgeNode.connections.db_user | string | `"bridge"` |  |
| bridgeNode.connections.redis_host | string | `"{{ template \"bridge.fullname\" . }}-redis-headless"` | Change in case of bringing your own redis and then also set redis.enabled:false |
| bridgeNode.connections.redis_port | string | `"6379"` |  |
| bridgeNode.containerSecurityContext | object | `{}` |  |
| bridgeNode.deploymentAnnotations | object | `{}` | Annotations to be added to bridgeNode deployment |
| bridgeNode.env | object | `{}` |  |
| bridgeNode.forceReload | bool | `false` | If true, forces deployment to reload on each upgrade |
| bridgeNode.initContainers | list | a container waiting for postgres | Init containers |
| bridgeNode.livenessProbe.failureThreshold | int | `3` |  |
| bridgeNode.livenessProbe.httpGet.path | string | `"/health"` |  |
| bridgeNode.livenessProbe.httpGet.port | string | `"http"` |  |
| bridgeNode.livenessProbe.initialDelaySeconds | int | `15` |  |
| bridgeNode.livenessProbe.periodSeconds | int | `15` |  |
| bridgeNode.livenessProbe.successThreshold | int | `1` |  |
| bridgeNode.livenessProbe.timeoutSeconds | int | `1` |  |
| bridgeNode.podAnnotations | object | `{}` | Annotations to be added to bridgeNode pods |
| bridgeNode.podLabels | object | `{}` | Labels to be added to bridgeNode pods |
| bridgeNode.podSecurityContext | object | `{}` |  |
| bridgeNode.readinessProbe.failureThreshold | int | `3` |  |
| bridgeNode.readinessProbe.httpGet.path | string | `"/health"` |  |
| bridgeNode.readinessProbe.httpGet.port | string | `"http"` |  |
| bridgeNode.readinessProbe.initialDelaySeconds | int | `15` |  |
| bridgeNode.readinessProbe.periodSeconds | int | `15` |  |
| bridgeNode.readinessProbe.successThreshold | int | `1` |  |
| bridgeNode.readinessProbe.timeoutSeconds | int | `1` |  |
| bridgeNode.replicaCount | int | `1` |  |
| bridgeNode.resources | object | `{}` | Resource settings for the bridgeNode pods - these settings overwrite might existing values from the global resources object defined above. |
| bridgeNode.startupProbe.failureThreshold | int | `60` |  |
| bridgeNode.startupProbe.httpGet.path | string | `"/health"` |  |
| bridgeNode.startupProbe.httpGet.port | string | `"http"` |  |
| bridgeNode.startupProbe.initialDelaySeconds | int | `15` |  |
| bridgeNode.startupProbe.periodSeconds | int | `5` |  |
| bridgeNode.startupProbe.successThreshold | int | `1` |  |
| bridgeNode.startupProbe.timeoutSeconds | int | `1` |  |
| bridgeNode.strategy | object | `{}` |  |
| bridgeWebsockets.command | list | `[]` |  |
| bridgeWebsockets.config | object | see `values.yaml` | The config.json to pass to the server, see https://github.com/kiranbmore0101/bridge/tree/master/bridge-websocket Note that the configuration can also read from environment variables (which will have priority), see https://github.com/kiranbmore0101/bridge/blob/master/bridge-websocket/src/config.ts for a list of supported variables |
| bridgeWebsockets.containerSecurityContext | object | `{}` |  |
| bridgeWebsockets.deploymentAnnotations | object | `{}` |  |
| bridgeWebsockets.enabled | bool | `false` | This is only required if you intend to use `GLOBAL_ASYNC_QUERIES` in `ws` mode see https://github.com/kiranbmore0101/bridge/blob/master/CONTRIBUTING.md#async-chart-queries |
| bridgeWebsockets.image.pullPolicy | string | `"IfNotPresent"` |  |
| bridgeWebsockets.image.repository | string | `"oneacrefund/bridge-websocket"` | There is no official image (yet), this one is community-supported |
| bridgeWebsockets.image.tag | string | `"latest"` |  |
| bridgeWebsockets.ingress.path | string | `"/ws"` |  |
| bridgeWebsockets.ingress.pathType | string | `"Prefix"` |  |
| bridgeWebsockets.livenessProbe.failureThreshold | int | `3` |  |
| bridgeWebsockets.livenessProbe.httpGet.path | string | `"/health"` |  |
| bridgeWebsockets.livenessProbe.httpGet.port | string | `"ws"` |  |
| bridgeWebsockets.livenessProbe.initialDelaySeconds | int | `5` |  |
| bridgeWebsockets.livenessProbe.periodSeconds | int | `5` |  |
| bridgeWebsockets.livenessProbe.successThreshold | int | `1` |  |
| bridgeWebsockets.livenessProbe.timeoutSeconds | int | `1` |  |
| bridgeWebsockets.podAnnotations | object | `{}` |  |
| bridgeWebsockets.podLabels | object | `{}` |  |
| bridgeWebsockets.podSecurityContext | object | `{}` |  |
| bridgeWebsockets.readinessProbe.failureThreshold | int | `3` |  |
| bridgeWebsockets.readinessProbe.httpGet.path | string | `"/health"` |  |
| bridgeWebsockets.readinessProbe.httpGet.port | string | `"ws"` |  |
| bridgeWebsockets.readinessProbe.initialDelaySeconds | int | `5` |  |
| bridgeWebsockets.readinessProbe.periodSeconds | int | `5` |  |
| bridgeWebsockets.readinessProbe.successThreshold | int | `1` |  |
| bridgeWebsockets.readinessProbe.timeoutSeconds | int | `1` |  |
| bridgeWebsockets.replicaCount | int | `1` |  |
| bridgeWebsockets.resources | object | `{}` |  |
| bridgeWebsockets.service.annotations | object | `{}` |  |
| bridgeWebsockets.service.port | int | `8080` |  |
| bridgeWebsockets.service.type | string | `"ClusterIP"` |  |
| bridgeWebsockets.startupProbe.failureThreshold | int | `60` |  |
| bridgeWebsockets.startupProbe.httpGet.path | string | `"/health"` |  |
| bridgeWebsockets.startupProbe.httpGet.port | string | `"ws"` |  |
| bridgeWebsockets.startupProbe.initialDelaySeconds | int | `5` |  |
| bridgeWebsockets.startupProbe.periodSeconds | int | `5` |  |
| bridgeWebsockets.startupProbe.successThreshold | int | `1` |  |
| bridgeWebsockets.startupProbe.timeoutSeconds | int | `1` |  |
| bridgeWebsockets.strategy | object | `{}` |  |
| bridgeWorker.command | list | a `celery worker` command | Worker startup command |
| bridgeWorker.containerSecurityContext | object | `{}` |  |
| bridgeWorker.deploymentAnnotations | object | `{}` | Annotations to be added to bridgeWorker deployment |
| bridgeWorker.forceReload | bool | `false` | If true, forces deployment to reload on each upgrade |
| bridgeWorker.initContainers | list | a container waiting for postgres and redis | Init container |
| bridgeWorker.livenessProbe.exec.command | list | a `celery inspect ping` command | Liveness probe command |
| bridgeWorker.livenessProbe.failureThreshold | int | `3` |  |
| bridgeWorker.livenessProbe.initialDelaySeconds | int | `120` |  |
| bridgeWorker.livenessProbe.periodSeconds | int | `60` |  |
| bridgeWorker.livenessProbe.successThreshold | int | `1` |  |
| bridgeWorker.livenessProbe.timeoutSeconds | int | `60` |  |
| bridgeWorker.podAnnotations | object | `{}` | Annotations to be added to bridgeWorker pods |
| bridgeWorker.podLabels | object | `{}` | Labels to be added to bridgeWorker pods |
| bridgeWorker.podSecurityContext | object | `{}` |  |
| bridgeWorker.readinessProbe | object | `{}` | No startup/readiness probes by default since we don't really care about its startup time (it doesn't serve traffic) |
| bridgeWorker.replicaCount | int | `1` |  |
| bridgeWorker.resources | object | `{}` | Resource settings for the bridgeWorker pods - these settings overwrite might existing values from the global resources object defined above. |
| bridgeWorker.startupProbe | object | `{}` | No startup/readiness probes by default since we don't really care about its startup time (it doesn't serve traffic) |
| bridgeWorker.strategy | object | `{}` |  |
| tolerations | list | `[]` |  |
