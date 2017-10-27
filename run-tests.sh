#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

cd tests
npm install node-fetch

OK=true

for test in *.js; do
    echo
    echo "Running $test"
    node "$test" || OK=false
done

echo
if [[ "$OK" == "true" ]]; then
    echo "All tests passed"
else
    echo "There were test failures"
    exit 1
fi
