#!/bin/sh

SCRIPT="$(readlink -f "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT")"
cd $SCRIPT_DIR

TYPE=""

if [ $1 = "major" ]; then
  TYPE="major"
elif [ $1 = "minor" ]; then
  TYPE="minor"
elif [ $1 = "patch" ]; then
  TYPE="patch"
else
  echo "Invalid option, accepted values are 'major', 'minor' or 'patch'"
  exit
fi

cd ./middleware && npm version "$TYPE" && npm publish --access public
cd ../mysql && npm version "$TYPE" && npm publish --access public
cd ../router && npm version "$TYPE" && npm publish --access public
cd ../server && npm version "$TYPE" && npm publish --access public
cd ../session && npm version "$TYPE" && npm publish --access public
cd ../storage && npm version "$TYPE" && npm publish --access public
cd ../template && npm version "$TYPE" && npm publish --access public