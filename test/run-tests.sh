#!/usr/bin/env bash

export DIR=$(pwd)

for f in $( find . -name "test.sh" ); do
	cd $(dirname $f)
	chmod a+x ./test.sh
	bash ./test.sh
	cd "${DIR}"
done