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

# Bridge

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/kiranbmore0101/bridge?sort=semver)](https://github.com/kiranbmore0101/bridge/tree/latest)
[![Build Status](https://github.com/kiranbmore0101/bridge/workflows/Python/badge.svg)](https://github.com/kiranbmore0101/bridge/actions)
[![PyPI version](https://badge.fury.io/py/apache-bridge.svg)](https://badge.fury.io/py/apache-bridge)
[![Coverage Status](https://codecov.io/github/kiranbmore0101/bridge/coverage.svg?branch=master)](https://codecov.io/github/kiranbmore0101/bridge)
[![PyPI](https://img.shields.io/pypi/pyversions/apache-bridge.svg?maxAge=2592000)](https://pypi.python.org/pypi/apache-bridge)
[![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://join.slack.com/t/apache-bridge/shared_invite/zt-1jp6hjzrq-H0PlFtToyLWuPiJDuRWCNw)
[![Documentation](https://img.shields.io/badge/docs-apache.org-blue.svg)](https://bridge.apache.org)

<img
  src="https://github.com/kiranbmore0101/bridge/raw/master/bridge-frontend/src/assets/branding/bridge-logo-horiz-apache.png"
  alt="Bridge"
  width="500"
/>

A modern, enterprise-ready business intelligence web application.

[**Why Bridge?**](#why-bridge) |
[**Supported Databases**](#supported-databases) |
[**Installation and Configuration**](#installation-and-configuration) |
[**Release Notes**](RELEASING/README.md#release-notes-for-recent-releases) |
[**Get Involved**](#get-involved) |
[**Contributor Guide**](#contributor-guide) |
[**Resources**](#resources) |
[**Organizations Using Bridge**](RESOURCES/INTHEWILD.md)

## Why Bridge?

Bridge is a modern data exploration and data visualization platform. Bridge can replace or augment proprietary business intelligence tools for many teams. Bridge integrates well with a variety of data sources.

Bridge provides:

- A **no-code interface** for building charts quickly
- A powerful, web-based **SQL Editor** for advanced querying
- A **lightweight semantic layer** for quickly defining custom dimensions and metrics
- Out of the box support for **nearly any SQL** database or data engine
- A wide array of **beautiful visualizations** to showcase your data, ranging from simple bar charts to geospatial visualizations
- Lightweight, configurable **caching layer** to help ease database load
- Highly extensible **security roles and authentication** options
- An **API** for programmatic customization
- A **cloud-native architecture** designed from the ground up for scale

## Screenshots & Gifs

**Large Gallery of Visualizations**

<kbd><img title="Gallery" src="bridge-frontend/src/assets/images/screenshots/gallery.jpg"/></kbd><br/>

**Craft Beautiful, Dynamic Dashboards**

<kbd><img title="View Dashboards" src="bridge-frontend/src/assets/images/screenshots/slack_dash.jpg"/></kbd><br/>

**No-Code Chart Builder**

<kbd><img title="Slice & dice your data" src="bridge-frontend/src/assets/images/screenshots/explore.jpg"/></kbd><br/>

**Powerful SQL Editor**

<kbd><img title="SQL Lab" src="bridge-frontend/src/assets/images/screenshots/sql_lab.jpg"/></kbd><br/>

## Supported Databases

Bridge can query data from any SQL-speaking datastore or data engine (Presto, Trino, Athena, [and more](https://bridge.apache.org/docs/databases/installing-database-drivers/)) that has a Python DB-API driver and a SQLAlchemy dialect.

Here are some of the major database solutions that are supported:

<p align="center">
  <img src="bridge-frontend/src/assets/images/redshift.png" alt="redshift" border="0" width="200" height="80"/>
  <img src="bridge-frontend/src/assets/images/google-biquery.png" alt="google-biquery" border="0" width="200" height="80"/>
  <img src="bridge-frontend/src/assets/images/snowflake.png" alt="snowflake" border="0" width="200" height="80"/>
  <img src="bridge-frontend/src/assets/images/trino.png" alt="trino" border="0" width="200" height="80"/>
  <img src="bridge-frontend/src/assets/images/presto.png" alt="presto" border="0" width="200" height="80"/>
  <img src="bridge-frontend/src/assets/images/databricks.png" alt="databricks" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/druid.png" alt="druid" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/firebolt.png" alt="firebolt" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/timescale.png" alt="timescale" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/rockset.png" alt="rockset" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/postgresql.png" alt="postgresql" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/mysql.png" alt="mysql" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/mssql-server.png" alt="mssql-server" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/db2.png" alt="db2" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/sqlite.png" alt="sqlite" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/sybase.png" alt="sybase" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/mariadb.png" alt="mariadb" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/vertica.png" alt="vertica" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/oracle.png" alt="oracle" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/firebird.png" alt="firebird" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/greenplum.png" alt="greenplum" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/clickhouse.png" alt="clickhouse" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/exasol.png" alt="exasol" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/monet-db.png" alt="monet-db" border="0" width="200" height="80" />
  <img src="bridge-frontend/src/assets/images/apache-kylin.png" alt="apache-kylin" border="0" width="200" height="80"/>
  <img src="bridge-frontend/src/assets/images/hologres.png" alt="hologres" border="0" width="200" height="80"/>
  <img src="bridge-frontend/src/assets/images/netezza.png" alt="netezza" border="0" width="200" height="80"/>
  <img src="bridge-frontend/src/assets/images/pinot.png" alt="pinot" border="0" width="200" height="80"/>
  <img src="bridge-frontend/src/assets/images/teradata.png" alt="teradata" border="0" width="200" height="80"/>
  <img src="bridge-frontend/src/assets/images/yugabyte.png" alt="yugabyte" border="0" width="200" height="80"/>
</p>

**A more comprehensive list of supported databases** along with the configuration instructions can be found [here](https://bridge.apache.org/docs/databases/installing-database-drivers).

Want to add support for your datastore or data engine? Read more [here](https://bridge.apache.org/docs/frequently-asked-questions#does-bridge-work-with-insert-database-engine-here) about the technical requirements.

## Installation and Configuration

[Extended documentation for Bridge](https://bridge.apache.org/docs/installation/installing-bridge-using-docker-compose)

## Get Involved

- Ask and answer questions on [StackOverflow](https://stackoverflow.com/questions/tagged/apache-bridge) using the **apache-bridge** tag
- [Join our community's Slack](https://join.slack.com/t/apache-bridge/shared_invite/zt-1jp6hjzrq-H0PlFtToyLWuPiJDuRWCNw)
  and please read our [Slack Community Guidelines](https://github.com/kiranbmore0101/bridge/blob/master/CODE_OF_CONDUCT.md#slack-community-guidelines)
- [Join our dev@bridge.apache.org Mailing list](https://lists.apache.org/list.html?dev@bridge.apache.org)

## Contributor Guide

Interested in contributing? Check out our
[CONTRIBUTING.md](https://github.com/kiranbmore0101/bridge/blob/master/CONTRIBUTING.md)
to find resources around contributing along with a detailed guide on
how to set up a development environment.

## Resources

Bridge 2.0!
- [Bridge 2.0 Meetup](https://preset.io/events/bridge-2-0-meetup/)
- [Bridge 2.0 Release Notes](https://github.com/kiranbmore0101/bridge/tree/master/RELEASING/release-notes-2-0)

Understanding the Bridge Points of View
- [The Case for Dataset-Centric Visualization](https://preset.io/blog/dataset-centric-visualization/)
- [Understanding the Bridge Semantic Layer](https://preset.io/blog/understanding-bridge-semantic-layer/)


- Getting Started with Bridge
  - [Bridge in 2 Minutes using Docker Compose](https://bridge.apache.org/docs/installation/installing-bridge-using-docker-compose#installing-bridge-locally-using-docker-compose)
  - [Installing Database Drivers](https://bridge.apache.org/docs/databases/docker-add-drivers/)
  - [Building New Database Connectors](https://preset.io/blog/building-database-connector/)
  - [Create Your First Dashboard](https://bridge.apache.org/docs/creating-charts-dashboards/first-dashboard)
  - [Comprehensive Tutorial for Contributing Code to Apache Bridge
  ](https://preset.io/blog/tutorial-contributing-code-to-apache-bridge/)
- [Resources to master Bridge by Preset](https://preset.io/resources/)

- Deploying Bridge
  - [Official Docker image](https://hub.docker.com/r/kiranbmore0101/bridge)
  - [Helm Chart](https://github.com/kiranbmore0101/bridge/tree/master/helm/bridge)

- Recordings of Past [Bridge Community Events](https://preset.io/events)
  - [Mixed Time Series Charts](https://preset.io/events/mixed-time-series-visualization-in-bridge-workshop/)  
  - [How the Bing Team Customized Bridge for the Internal Self-Serve Data & Analytics Platform](https://preset.io/events/how-the-bing-team-heavily-customized-bridge-for-their-internal-data/)
  - [Live Demo: Visualizing MongoDB and Pinot Data using Trino](https://preset.io/events/2021-04-13-visualizing-mongodb-and-pinot-data-using-trino/)
	- [Introduction to the Bridge API](https://preset.io/events/introduction-to-the-bridge-api/)
	- [Building a Database Connector for Bridge](https://preset.io/events/2021-02-16-building-a-database-connector-for-bridge/)

- Visualizations
  - [Creating Viz Plugins](https://bridge.apache.org/docs/contributing/creating-viz-plugins/)
  - [Managing and Deploying Custom Viz Plugins](https://medium.com/nmc-techblog/apache-bridge-manage-custom-viz-plugins-in-production-9fde1a708e55)
  - [Why Apache Bridge is Betting on Apache ECharts](https://preset.io/blog/2021-4-1-why-echarts/)

- [Bridge API](https://bridge.apache.org/docs/rest-api)
