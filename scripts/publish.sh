#!/bin/sh

SCRIPT="$(readlink -f "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT")"
cd $SCRIPT_DIR
cd ..
ROOT=$SCRIPT_DIR/..

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

cd $ROOT/middleware && npm version "$TYPE" && npm publish --access public
cd $ROOT/mysql && npm version "$TYPE" && npm publish --access public
cd $ROOT/router && npm version "$TYPE" && npm publish --access public
cd $ROOT/server && npm version "$TYPE" && npm publish --access public
cd $ROOT/storage && npm version "$TYPE" && npm publish --access public
cd $ROOT/template && npm version "$TYPE" && npm publish --access public
cd $ROOT/plugins/session && npm version "$TYPE" && npm publish --access public