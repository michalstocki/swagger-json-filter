#!/usr/bin/env bash

cat input.json | swagger-json-filter --include-definitions="(^Error.*)|(^Profile.*)"