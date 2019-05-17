#!/bin/sh

SCRIPT="$(readlink -f "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT")"
cd $SCRIPT_DIR

TYPE=""

if [ $1 = "patch" ]; then
  TYPE="patch"
elif [ $1 = "minor" ]; then
  TYPE="minor"
elif [ $1 = "major" ]; then
  TYPE="major"
else
  echo "Invalid option, accepted values are 'major', 'minor' or 'patch'"
  exit
fi

# cd ./middleware && npm version patch && npm publish --access public &
# cd ../mysql && npm version patch && npm publish --access public &
# cd ../router && npm version patch && npm publish --access public &
# cd ../server && npm version patch && npm publish --access public &
# cd ../session && npm version patch && npm publish --access public &
# cd ../storage && npm version patch && npm publish --access public &
# cd ../template && npm version patch && npm publish --access public &
wait