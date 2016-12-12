#!/usr/bin/env bash
PATH=$(npm bin):$PATH

chmod a+x $(npm prefix)/bin/swagger-json-filter
PATH=$(npm prefix)/bin:$PATH

export DIR=$(pwd)
totalTestCount=0
failedTestCount=0

for f in $( find . -name "test.sh" ); do
    ((totalTestCount++))
	cd $(dirname $f)
	chmod a+x ./test.sh
	bash ./test.sh > output.json
	output=$(json-diff output.json expected-output.json);
	if [ "$output" != " undefined" ] ; then
        ((failedTestCount++))
	    echo "Test failed: $(pwd)"
	    json-diff output.json expected-output.json
	fi
	rm output.json
	cd "${DIR}"
done


RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'
if (( failedTestCount > 0 )) ; then
    echo -e "${RED}${failedTestCount} of ${totalTestCount} tests FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}All ${totalTestCount} tests PASSED${NC}"
    exit 0
fi