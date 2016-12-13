#!/usr/bin/env bash

cat input.json | swagger-json-filter --include-paths="^\/estimates\/.*" --include-definitions="(^Error.*)|(^Profile.*)"