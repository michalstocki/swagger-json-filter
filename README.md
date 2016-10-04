# swagger-json-filter

Command-line tool for filtering documentation created with Swagger.

The filter matches all paths defined in the input JSON against the given regular expression. Definition of all paths that don't match given regex, are removed. In the second step tool filters all data structure definitions and removes all that are not used within the remaining part of the paths.

## Usage

Install package globally
```
npm install -g swagger-json-filter
```

then you can provide contents of the JSON file to the stdin:
```
cat swagger.json | swagger-json-filter --include-paths="\/api\/.*" > filtered-swagger.json
```

