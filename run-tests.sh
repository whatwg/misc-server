#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

cd tests
for test in *.js; do
    echo "Running $test"
    node "$test"
    echo
done
