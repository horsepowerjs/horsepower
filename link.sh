: '
WARNING: This is for development usage only.
Execute this file to generate global development links.
This file will attempt the following:
  - Remove any current global links
  - Remove all node_modules/@red5 in the source of each module
  - Generate new global links
  - Link all the modules to their dependencies
'

# npm link @red5/server @red5/router @red5/middleware @red5/session @red5/storage @red5/template @red5/mysql @red5/auth

CYAN='\033[0;36m'
NC='\033[0m'

# Go to the initial start location
SCRIPT="$(readlink -f "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT")"
cd $SCRIPT_DIR

printf "${CYAN}Removing global @red5 packages${NC}\n"
# npm rm -grf @red5/middleware &
npm rm -g @red5/router &
npm rm -g @red5/server &
npm rm -g @red5/session &
npm rm -g @red5/storage &
npm rm -g @red5/template &
npm rm -g @red5/mysql &
npm rm -g @red5/auth &
wait

printf "${CYAN}Removing node_modules/@red5 from modules${NC}\n"
# rm -rf ./middleware/node_modules/@red5 &
rm -rf ./mysql/node_modules/@red5 &
rm -rf ./router/node_modules/@red5 &
rm -rf ./server/node_modules/@red5 &
rm -rf ./storage/node_modules/@red5 &
rm -rf ./template/node_modules/@red5 &
rm -rf ./plugins/session/node_modules/@red5 &
rm -rf ./plugins/auth/node_modules/@red5 &
wait

# Generate the links
printf "${CYAN}Generating npm links${NC}\n"
npm link ./router
npm link ./server
npm link ./storage
npm link ./template
# npm link ./middleware
npm link ./mysql
npm link ./plugins/session
npm link ./plugins/auth

# Link the server to the dependencies
# These dependencies should be the same dependencies
# that are found in the modules "package.json"
printf "${CYAN}Linking the dependencies${NC}\n"
cd $SCRIPT_DIR/server
npm link @red5/router
npm link @red5/session
npm link @red5/storage
# npm link @red5/middleware
npm link @red5/server
# These modules are optional but may be needed for development.
# They are not required in the "package.json".
# The user should manually add them if they need these modules in production.
# However, we need them for development purposes.
npm link @red5/template
npm link @red5/mysql
npm link @red5/auth

# cd $SCRIPT_DIR/middleware
# npm link @red5/server
# npm link @red5/router
# npm link @red5/session

cd $SCRIPT_DIR/mysql
npm link @red5/server

cd $SCRIPT_DIR/router
# npm link @red5/middleware
npm link @red5/server

cd $SCRIPT_DIR/template
npm link @red5/storage

cd $SCRIPT_DIR/plugins/session
npm link @red5/server
npm link @red5/storage

cd $SCRIPT_DIR/plugins/auth
npm link @red5/mysql
npm link @red5/router
npm link @red5/server
npm link @red5/session

# printf "${CYAN}Building packages${NC}\n"
# cd ..
# gulp build