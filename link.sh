CYAN='\033[0;36m'
NC='\033[0m'

# Go to the inital start location
SCRIPT="$(readlink -f "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT")"
cd $SCRIPT_DIR

printf "${CYAN}Removing global @red5 packages${NC}\n"
npm rm -g @red5/middleware &
npm rm -g @red5/router &
npm rm -g @red5/server &
npm rm -g @red5/session &
npm rm -g @red5/storage &
npm rm -g @red5/template &
wait

# Generate the links
printf "${CYAN}Generating npm links${NC}\n"
npm link ./router &
npm link ./server &
npm link ./session &
npm link ./storage &
npm link ./template &
npm link ./middleware &
wait

# Link the server to the dependencies
printf "${CYAN}Linking the server to the dependencies${NC}\n"
cd ./server
npm link @red5/router &
npm link @red5/session &
npm link @red5/storage &
npm link @red5/template &
npm link @red5/middleware &
wait

printf "${CYAN}Linking the middleware to the server${NC}\n"
cd ../middleware
npm link @red5/server &
cd ../router
npm link @red5/middleware &
wait

# Link the test server to the dependencies
printf "${CYAN}Linking the server testing playground${NC}\n"
cd ../test
npm link @red5/router &
npm link @red5/session &
npm link @red5/storage &
npm link @red5/template &
npm link @red5/server &
npm link @red5/middleware &
wait

# Install all other dependenceis
# cd ../server && npm install
# cd ../session && npm install
# cd ../storage && npm install
# cd ../template && npm install