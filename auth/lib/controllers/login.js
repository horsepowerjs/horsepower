"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@red5/server");
class default_1 {
    async login(client) {
        let config = server_1.getConfig('auth');
        let Login = (await Promise.resolve().then(() => require('../helpers/Login'))).Login;
        let login = new Login(client);
        let success = await login.login(client.data.post('username'), client.data.post('password'));
        // Ajax request error response
        if (!success && client.ajax)
            return client.response.json({ success });
        // Ajax request success response
        else if (success && client.ajax)
            return client.response.json({ success });
        // Non-ajax request success response
        else if (success && !client.ajax && config && config.redirect && config.redirect.success) {
            if (config.redirect.success.to)
                return client.response.redirect.to(config.redirect.success.to);
            else if (config.redirect.success.location)
                return client.response.redirect.location(config.redirect.success.location);
            return client.response.redirect.location(config.login || '/');
        }
        // Non-ajax request error response
        else if (!success && !client.ajax && config && config.redirect && config.redirect.error) {
            if (config.redirect.error.to)
                return client.response.redirect.to(config.redirect.error.to);
            else if (config.redirect.error.location)
                return client.response.redirect.location(config.redirect.error.location);
            return client.response.redirect.location(config.login || '/');
        }
    }
    async join(client) {
    }
}
exports.default = default_1;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb250cm9sbGVycy9sb2dpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFnRDtBQUdoRDtJQUNTLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBYztRQUMvQixJQUFJLE1BQU0sR0FBRyxrQkFBUyxDQUFlLE1BQU0sQ0FBQyxDQUFBO1FBRTVDLElBQUksS0FBSyxHQUFHLENBQUMsMkNBQWEsa0JBQWtCLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQTtRQUNwRCxJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUM3QixJQUFJLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtRQUMzRiw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsSUFBSTtZQUFFLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FBQ3JFLGdDQUFnQzthQUMzQixJQUFJLE9BQU8sSUFBSSxNQUFNLENBQUMsSUFBSTtZQUFFLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FBQ3pFLG9DQUFvQzthQUMvQixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUU7WUFDeEYsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUM1QixPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQTtpQkFDM0QsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRO2dCQUN2QyxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUM1RSxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFBO1NBQzlEO1FBQ0Qsa0NBQWtDO2FBQzdCLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFO1lBQ3ZGLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDMUIsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7aUJBQ3pELElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUTtnQkFDckMsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDMUUsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsQ0FBQTtTQUM5RDtJQUNILENBQUM7SUFFTSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQWM7SUFFaEMsQ0FBQztDQUNGO0FBaENELDRCQWdDQyIsImZpbGUiOiJjb250cm9sbGVycy9sb2dpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENsaWVudCwgZ2V0Q29uZmlnIH0gZnJvbSAnQHJlZDUvc2VydmVyJ1xuaW1wb3J0IHsgQXV0aFNldHRpbmdzIH0gZnJvbSAnLi4vcm91dGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyB7XG4gIHB1YmxpYyBhc3luYyBsb2dpbihjbGllbnQ6IENsaWVudCkge1xuICAgIGxldCBjb25maWcgPSBnZXRDb25maWc8QXV0aFNldHRpbmdzPignYXV0aCcpXG5cbiAgICBsZXQgTG9naW4gPSAoYXdhaXQgaW1wb3J0KCcuLi9oZWxwZXJzL0xvZ2luJykpLkxvZ2luXG4gICAgbGV0IGxvZ2luID0gbmV3IExvZ2luKGNsaWVudClcbiAgICBsZXQgc3VjY2VzcyA9IGF3YWl0IGxvZ2luLmxvZ2luKGNsaWVudC5kYXRhLnBvc3QoJ3VzZXJuYW1lJyksIGNsaWVudC5kYXRhLnBvc3QoJ3Bhc3N3b3JkJykpXG4gICAgLy8gQWpheCByZXF1ZXN0IGVycm9yIHJlc3BvbnNlXG4gICAgaWYgKCFzdWNjZXNzICYmIGNsaWVudC5hamF4KSByZXR1cm4gY2xpZW50LnJlc3BvbnNlLmpzb24oeyBzdWNjZXNzIH0pXG4gICAgLy8gQWpheCByZXF1ZXN0IHN1Y2Nlc3MgcmVzcG9uc2VcbiAgICBlbHNlIGlmIChzdWNjZXNzICYmIGNsaWVudC5hamF4KSByZXR1cm4gY2xpZW50LnJlc3BvbnNlLmpzb24oeyBzdWNjZXNzIH0pXG4gICAgLy8gTm9uLWFqYXggcmVxdWVzdCBzdWNjZXNzIHJlc3BvbnNlXG4gICAgZWxzZSBpZiAoc3VjY2VzcyAmJiAhY2xpZW50LmFqYXggJiYgY29uZmlnICYmIGNvbmZpZy5yZWRpcmVjdCAmJiBjb25maWcucmVkaXJlY3Quc3VjY2Vzcykge1xuICAgICAgaWYgKGNvbmZpZy5yZWRpcmVjdC5zdWNjZXNzLnRvKVxuICAgICAgICByZXR1cm4gY2xpZW50LnJlc3BvbnNlLnJlZGlyZWN0LnRvKGNvbmZpZy5yZWRpcmVjdC5zdWNjZXNzLnRvKVxuICAgICAgZWxzZSBpZiAoY29uZmlnLnJlZGlyZWN0LnN1Y2Nlc3MubG9jYXRpb24pXG4gICAgICAgIHJldHVybiBjbGllbnQucmVzcG9uc2UucmVkaXJlY3QubG9jYXRpb24oY29uZmlnLnJlZGlyZWN0LnN1Y2Nlc3MubG9jYXRpb24pXG4gICAgICByZXR1cm4gY2xpZW50LnJlc3BvbnNlLnJlZGlyZWN0LmxvY2F0aW9uKGNvbmZpZy5sb2dpbiB8fCAnLycpXG4gICAgfVxuICAgIC8vIE5vbi1hamF4IHJlcXVlc3QgZXJyb3IgcmVzcG9uc2VcbiAgICBlbHNlIGlmICghc3VjY2VzcyAmJiAhY2xpZW50LmFqYXggJiYgY29uZmlnICYmIGNvbmZpZy5yZWRpcmVjdCAmJiBjb25maWcucmVkaXJlY3QuZXJyb3IpIHtcbiAgICAgIGlmIChjb25maWcucmVkaXJlY3QuZXJyb3IudG8pXG4gICAgICAgIHJldHVybiBjbGllbnQucmVzcG9uc2UucmVkaXJlY3QudG8oY29uZmlnLnJlZGlyZWN0LmVycm9yLnRvKVxuICAgICAgZWxzZSBpZiAoY29uZmlnLnJlZGlyZWN0LmVycm9yLmxvY2F0aW9uKVxuICAgICAgICByZXR1cm4gY2xpZW50LnJlc3BvbnNlLnJlZGlyZWN0LmxvY2F0aW9uKGNvbmZpZy5yZWRpcmVjdC5lcnJvci5sb2NhdGlvbilcbiAgICAgIHJldHVybiBjbGllbnQucmVzcG9uc2UucmVkaXJlY3QubG9jYXRpb24oY29uZmlnLmxvZ2luIHx8ICcvJylcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgam9pbihjbGllbnQ6IENsaWVudCkge1xuXG4gIH1cbn0iXX0=
