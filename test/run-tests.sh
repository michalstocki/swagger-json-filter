#!/usr/bin/env bash
PATH=$(npm bin):$PATH

export DIR=$(pwd)
shouldFail=false

for f in $( find . -name "test.sh" ); do
	cd $(dirname $f)
	chmod a+x ./test.sh
	bash ./test.sh > output.json
	output=$(json-diff output.json expected-output.json);
	if [ "$output" != " undefined" ] ; then
	    shouldFail=true
	    echo "Test failed: $(pwd)"
	    json-diff output.json expected-output.json
	fi
	rm output.json
	cd "${DIR}"
done

if [ "$shouldFail" = true ] ; then
    echo "Tests failed due to errors"
    exit 1
fi