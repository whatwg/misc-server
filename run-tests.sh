#!/bin/sh -e

for t in tests/*; do
    node "$t"
done
