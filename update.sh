CYAN='\033[0;36m'
NC='\033[0m'

# Go to the inital start location
SCRIPT="$(readlink -f "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT")"
cd $SCRIPT_DIR

printf "${CYAN}Updating @red5 packages${NC}\n"
cd ./mysql && npm update && npm audit fix
cd ../router && npm update && npm audit fix
cd ../server && npm update && npm audit fix
cd ../storage && npm update && npm audit fix
cd ../template && npm update && npm audit fix
cd ../plugins/auth && npm update && npm audit fix
cd ../session && npm update && npm audit fix
cd ../sockets && npm update && npm audit fix
wait