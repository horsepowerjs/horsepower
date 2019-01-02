# Generate the links
npm link ./router
npm link ./server
npm link ./session
npm link ./storage
npm link ./template
npm link ./middleware

# Link the server to the dependencies
cd ./server
npm link @red5/router
npm link @red5/session
npm link @red5/storage
npm link @red5/template
npm link @red5/middleware

# Link the test server to the dependencies
cd ../test
npm link @red5/router
npm link @red5/session
npm link @red5/storage
npm link @red5/template
npm link @red5/server
npm link @red5/middleware

cd ../middleware
npm link @red5/server

# Install all other dependenceis
# cd ../server && npm install
# cd ../session && npm install
# cd ../storage && npm install
# cd ../template && npm install