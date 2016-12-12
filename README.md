# swagger-json-filter

[![Build Status](https://travis-ci.org/michalstocki/swagger-json-filter.svg?branch=master)](https://travis-ci.org/michalstocki/swagger-json-filter)

Command-line tool for filtering documentation created with Swagger.

The filter matches all paths defined in the input JSON against the given regular expression. Definition of all paths that don't match given regex, are removed. In the second step tool filters all data structure definitions and removes all that are not used within the remaining part of the paths.

## Usage

### as node.js package
We can use the swagger-json-filter from a js code, givng the input JSON string and options of filtering:
```
const swaggerJsonFilter = require('swagger-json-filter');
const output = swaggerJsonFilter(inputJsonString, {
    includePaths: "^\/estimates\/.*"
});
```

### as command line tool
Install package globally
```
npm install -g swagger-json-filter
```

then you can provide contents of the above JSON file to the stdin:
```
cat input.json | swagger-json-filter --include-paths="^\/estimates\/.*" > output.json
```

input.json:
```
{
  "swagger": "2.0",
  "info": {"version": "0.0.0", "title": "Simple API"},
  "paths": {
    "/estimates/price": {
      "get": {
        "responses": {
          "200": {
            "description": "An array of price estimates by product",
            "schema": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/PriceEstimate"
              }}}}}},
    "/me": {
      "get": {
        "responses": {
          "200": {
            "description": "Unexpected error",
            "schema": {
              "$ref": "#/definitions/Error"
            }}}}}
   },
  "definitions": {
    "PriceEstimate": {
      "type": "object",
      "properties": {
        "product_id": {
          "type": "string",
          "description": "Unique identifier"
        }}},
    "Error": {
      "type": "object",
      "properties": {
        "code": {
          "type": "integer",
          "format": "int32"
        }}}
  }
}
```

and we recive following output.json
```
{
  "swagger": "2.0",
  "info": {"version": "0.0.0", "title": "Simple API"},
  "paths": {
    "/estimates/price": {
      "get": {
        "responses": {
          "200": {
            "description": "An array of price estimates by product",
            "schema": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/PriceEstimate"
              }}}}}}
   },
  "definitions": {
    "PriceEstimate": {
      "type": "object",
      "properties": {
        "product_id": {
          "type": "string",
          "description": "Unique identifier"
        }}}
  }
}
```

## Acknowledgements ##

Great thanks for [Young Digital Planet](http://www.ydp.eu/) for supporting creation of this tool.
