#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

# cd to the directory containing this script
cd "$(dirname "$0")"

# Update any existing apps that have a matching configuraton in this directory.
# This will neither create nor destroy apps, that must be done manually.
doctl apps list --no-header | while read id spec _; do
  if [[ -f "$spec.yaml" ]]; then
    echo "Updating $spec"
    doctl apps update "$id" --spec="$spec.yaml"
  fi
done
