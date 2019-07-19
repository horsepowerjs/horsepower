CYAN='\033[0;36m'
NC='\033[0m'

# Go to the inital start location
SCRIPT="$(readlink -f "$0")"
SCRIPT_DIR="$(dirname "$SCRIPT")"
cd $SCRIPT_DIR
cd ..
ROOT=$SCRIPT_DIR/..

printf "${CYAN}Removing global @red5 packages${NC}\n"
npm rm -g @red5/middleware &
npm rm -g @red5/router &
npm rm -g @red5/server &
npm rm -g @red5/session &
npm rm -g @red5/storage &
npm rm -g @red5/template &
wait