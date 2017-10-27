#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

# do nothing on Travis except for the master branch
TRAVIS=${TRAVIS:-false}
if [[ "$TRAVIS" == "true" && "$TRAVIS_BRANCH" != "master" ]]; then
    echo "Skipping tests for branch $TRAVIS_BRANCH (not master)"
    exit 0
fi

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
