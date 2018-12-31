npm link ./router
npm link ./server
npm link ./session
npm link ./storage
npm link ./template
npm link ./core

# cd core && npm unlink && npm link
# cd ../router && npm unlink && npm link
# cd ../server && npm unlink && npm link && npm link core
# cd ../session && npm unlink && npm link
# cd ../storage && npm unlink && npm link
# cd ../template && npm unlink && npm link

cd ./core
npm link @red5/router
npm link @red5/server
npm link @red5/session
npm link @red5/storage
npm link @red5/template