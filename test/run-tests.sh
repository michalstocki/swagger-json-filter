#!/usr/bin/env bash
PATH=$(npm bin):$PATH

export DIR=$(pwd)

for f in $( find . -name "test.sh" ); do
	cd $(dirname $f)
	chmod a+x ./test.sh
	bash ./test.sh > output.json
	output=$(json-diff output.json expected-output.json);
	if [ "$output" != " undefined" ] ; then
	    echo "Test failed: $(pwd)"
	    json-diff output.json expected-output.json
	fi
	rm output.json
	cd "${DIR}"
done