"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@red5/server");
const Login_1 = require("../helpers/Login");
class default_1 {
    constructor() {
        this.config = server_1.getConfig('auth');
    }
    async login(client) {
        let config = this.config;
        let login = new Login_1.Login(client);
        let success = await login.login(client.data.post('username'), client.data.post('password'));
        // Ajax request error response
        if (!success && client.ajax)
            return client.response.json({ success });
        // Ajax request success response
        else if (success && client.ajax)
            return client.response.json({ success });
        // Non-ajax request success response
        else if (success && !client.ajax && config && config.redirect && config.redirect.login) {
            if (config.redirect.login.success.to)
                return client.response.redirect.to(config.redirect.login.success.to);
            else if (config.redirect.login.success.location)
                return client.response.redirect.location(config.redirect.login.success.location);
            return client.response.redirect.location(config.login || '/');
        }
        // Non-ajax request error response
        else if (!success && !client.ajax && config && config.redirect && config.redirect.login) {
            if (config.redirect.login.error.to)
                return client.response.redirect.to(config.redirect.login.error.to);
            else if (config.redirect.login.error.location)
                return client.response.redirect.location(config.redirect.login.error.location);
            return client.response.redirect.location(config.login || '/');
        }
    }
    async join(client) {
        let config = this.config;
        let login = new Login_1.Login(client);
        let success = await login.join(client.data.post('username'), client.data.post('password'));
        // Ajax request error response
        if (!success && client.ajax)
            return client.response.json({ success });
        // Ajax request success response
        else if (success && client.ajax)
            return client.response.json({ success });
        // Non-ajax request success response
        else if (success && !client.ajax && config && config.redirect && config.redirect.join) {
            if (config.redirect.join.success.to)
                return client.response.redirect.to(config.redirect.join.success.to);
            else if (config.redirect.join.success.location)
                return client.response.redirect.location(config.redirect.join.success.location);
            return client.response.redirect.location(config.login || '/');
        }
        // Non-ajax request error response
        else if (!success && !client.ajax && config && config.redirect && config.redirect.join) {
            if (config.redirect.join.error.to)
                return client.response.redirect.to(config.redirect.join.error.to);
            else if (config.redirect.join.error.location)
                return client.response.redirect.location(config.redirect.join.error.location);
            return client.response.redirect.location(config.login || '/');
        }
    }
}
exports.default = default_1;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb250cm9sbGVycy9hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQWdEO0FBRWhELDRDQUF3QztBQUV4QztJQUdFO1FBQ0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxrQkFBUyxDQUFlLE1BQU0sQ0FBQyxDQUFBO0lBQy9DLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQWM7UUFDL0IsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUN4QixJQUFJLEtBQUssR0FBRyxJQUFJLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUM3QixJQUFJLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtRQUMzRiw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsSUFBSTtZQUFFLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FBQ3JFLGdDQUFnQzthQUMzQixJQUFJLE9BQU8sSUFBSSxNQUFNLENBQUMsSUFBSTtZQUFFLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FBQ3pFLG9DQUFvQzthQUMvQixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7WUFDdEYsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDbEMsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMs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Q0FBQTtZQUNqRixPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFBO1NBQzlEO1FBQ0Qsa0NBQWtDO2FBQzdCLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO1lBQ3RGLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQy9CLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQTtpQkFDOUQsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtnQkFDMUMsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQy9FLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLENBQUE7U0FDOUQ7SUFDSCxDQUFDO0NBQ0Y7QUExREQsNEJBMERDIiwiZmlsZSI6ImNvbnRyb2xsZXJzL2F1dGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDbGllbnQsIGdldENvbmZpZyB9IGZyb20gJ0ByZWQ1L3NlcnZlcidcbmltcG9ydCB7IEF1dGhTZXR0aW5ncyB9IGZyb20gJy4uL3JvdXRlcydcbmltcG9ydCB7IExvZ2luIH0gZnJvbSAnLi4vaGVscGVycy9Mb2dpbidcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xuXG4gIHByaXZhdGUgY29uZmlnPzogQXV0aFNldHRpbmdzXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGdldENvbmZpZzxBdXRoU2V0dGluZ3M+KCdhdXRoJylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBsb2dpbihjbGllbnQ6IENsaWVudCkge1xuICAgIGxldCBjb25maWcgPSB0aGlzLmNvbmZpZ1xuICAgIGxldCBsb2dpbiA9IG5ldyBMb2dpbihjbGllbnQpXG4gICAgbGV0IHN1Y2Nlc3MgPSBhd2FpdCBsb2dpbi5sb2dpbihjbGllbnQuZGF0YS5wb3N0KCd1c2VybmFtZScpLCBjbGllbnQuZGF0YS5wb3N0KCdwYXNzd29yZCcpKVxuICAgIC8vIEFqYXggcmVxdWVzdCBlcnJvciByZXNwb25zZVxuICAgIGlmICghc3VjY2VzcyAmJiBjbGllbnQuYWpheCkgcmV0dXJuIGNsaWVudC5yZXNwb25zZS5qc29uKHsgc3VjY2VzcyB9KVxuICAgIC8vIEFqYXggcmVxdWVzdCBzdWNjZXNzIHJlc3BvbnNlXG4gICAgZWxzZSBpZiAoc3VjY2VzcyAmJiBjbGllbnQuYWpheCkgcmV0dXJuIGNsaWVudC5yZXNwb25zZS5qc29uKHsgc3VjY2VzcyB9KVxuICAgIC8vIE5vbi1hamF4IHJlcXVlc3Qgc3VjY2VzcyByZXNwb25zZVxuICAgIGVsc2UgaWYgKHN1Y2Nlc3MgJiYgIWNsaWVudC5hamF4ICYmIGNvbmZpZyAmJiBjb25maWcucmVkaXJlY3QgJiYgY29uZmlnLnJlZGlyZWN0LmxvZ2luKSB7XG4gICAgICBpZiAoY29uZmlnLnJlZGlyZWN0LmxvZ2luLnN1Y2Nlc3MudG8pXG4gICAgICAgIHJldHVybiBjbGllbnQucmVzcG9uc2UucmVkaXJlY3QudG8oY29uZmlnLnJlZGlyZWN0LmxvZ2luLnN1Y2Nlc3MudG8pXG4gICAgICBlbHNlIGlmIChjb25maWcucmVkaXJlY3QubG9naW4uc3VjY2Vzcy5sb2NhdGlvbilcbiAgICAgICAgcmV0dXJuIGNsaWVudC5yZXNwb25zZS5yZWRpcmVjdC5sb2NhdGlvbihjb25maWcucmVkaXJlY3QubG9naW4uc3VjY2Vzcy5sb2NhdGlvbilcbiAgICAgIHJldHVybiBjbGllbnQucmVzcG9uc2UucmVkaXJlY3QubG9jYXRpb24oY29uZmlnLmxvZ2luIHx8ICcvJylcbiAgICB9XG4gICAgLy8gTm9uLWFqYXggcmVxdWVzdCBlcnJvciByZXNwb25zZVxuICAgIGVsc2UgaWYgKCFzdWNjZXNzICYmICFjbGllbnQuYWpheCAmJiBjb25maWcgJiYgY29uZmlnLnJlZGlyZWN0ICYmIGNvbmZpZy5yZWRpcmVjdC5sb2dpbikge1xuICAgICAgaWYgKGNvbmZpZy5yZWRpcmVjdC5sb2dpbi5lcnJvci50bylcbiAgICAgICAgcmV0dXJuIGNsaWVudC5yZXNwb25zZS5yZWRpcmVjdC50byhjb25maWcucmVkaXJlY3QubG9naW4uZXJyb3IudG8pXG4gICAgICBlbHNlIGlmIChjb25maWcucmVkaXJlY3QubG9naW4uZXJyb3IubG9jYXRpb24pXG4gICAgICAgIHJldHVybiBjbGllbnQucmVzcG9uc2UucmVkaXJlY3QubG9jYXRpb24oY29uZmlnLnJlZGlyZWN0LmxvZ2luLmVycm9yLmxvY2F0aW9uKVxuICAgICAgcmV0dXJuIGNsaWVudC5yZXNwb25zZS5yZWRpcmVjdC5sb2NhdGlvbihjb25maWcubG9naW4gfHwgJy8nKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBqb2luKGNsaWVudDogQ2xpZW50KSB7XG4gICAgbGV0IGNvbmZpZyA9IHRoaXMuY29uZmlnXG4gICAgbGV0IGxvZ2luID0gbmV3IExvZ2luKGNsaWVudClcbiAgICBsZXQgc3VjY2VzcyA9IGF3YWl0IGxvZ2luLmpvaW4oY2xpZW50LmRhdGEucG9zdCgndXNlcm5hbWUnKSwgY2xpZW50LmRhdGEucG9zdCgncGFzc3dvcmQnKSlcbiAgICAvLyBBamF4IHJlcXVlc3QgZXJyb3IgcmVzcG9uc2VcbiAgICBpZiAoIXN1Y2Nlc3MgJiYgY2xpZW50LmFqYXgpIHJldHVybiBjbGllbnQucmVzcG9uc2UuanNvbih7IHN1Y2Nlc3MgfSlcbiAgICAvLyBBamF4IHJlcXVlc3Qgc3VjY2VzcyByZXNwb25zZVxuICAgIGVsc2UgaWYgKHN1Y2Nlc3MgJiYgY2xpZW50LmFqYXgpIHJldHVybiBjbGllbnQucmVzcG9uc2UuanNvbih7IHN1Y2Nlc3MgfSlcbiAgICAvLyBOb24tYWpheCByZXF1ZXN0IHN1Y2Nlc3MgcmVzcG9uc2VcbiAgICBlbHNlIGlmIChzdWNjZXNzICYmICFjbGllbnQuYWpheCAmJiBjb25maWcgJiYgY29uZmlnLnJlZGlyZWN0ICYmIGNvbmZpZy5yZWRpcmVjdC5qb2luKSB7XG4gICAgICBpZiAoY29uZmlnLnJlZGlyZWN0LmpvaW4uc3VjY2Vzcy50bylcbiAgICAgICAgcmV0dXJuIGNsaWVudC5yZXNwb25zZS5yZWRpcmVjdC50byhjb25maWcucmVkaXJlY3Quam9pbi5zdWNjZXNzLnRvKVxuICAgICAgZWxzZSBpZiAoY29uZmlnLnJlZGlyZWN0LmpvaW4uc3VjY2Vzcy5sb2NhdGlvbilcbiAgICAgICAgcmV0dXJuIGNsaWVudC5yZXNwb25zZS5yZWRpcmVjdC5sb2NhdGlvbihjb25maWcucmVkaXJlY3Quam9pbi5zdWNjZXNzLmxvY2F0aW9uKVxuICAgICAgcmV0dXJuIGNsaWVudC5yZXNwb25zZS5yZWRpcmVjdC5sb2NhdGlvbihjb25maWcubG9naW4gfHwgJy8nKVxuICAgIH1cbiAgICAvLyBOb24tYWpheCByZXF1ZXN0IGVycm9yIHJlc3BvbnNlXG4gICAgZWxzZSBpZiAoIXN1Y2Nlc3MgJiYgIWNsaWVudC5hamF4ICYmIGNvbmZpZyAmJiBjb25maWcucmVkaXJlY3QgJiYgY29uZmlnLnJlZGlyZWN0LmpvaW4pIHtcbiAgICAgIGlmIChjb25maWcucmVkaXJlY3Quam9pbi5lcnJvci50bylcbiAgICAgICAgcmV0dXJuIGNsaWVudC5yZXNwb25zZS5yZWRpcmVjdC50byhjb25maWcucmVkaXJlY3Quam9pbi5lcnJvci50bylcbiAgICAgIGVsc2UgaWYgKGNvbmZpZy5yZWRpcmVjdC5qb2luLmVycm9yLmxvY2F0aW9uKVxuICAgICAgICByZXR1cm4gY2xpZW50LnJlc3BvbnNlLnJlZGlyZWN0LmxvY2F0aW9uKGNvbmZpZy5yZWRpcmVjdC5qb2luLmVycm9yLmxvY2F0aW9uKVxuICAgICAgcmV0dXJuIGNsaWVudC5yZXNwb25zZS5yZWRpcmVjdC5sb2NhdGlvbihjb25maWcubG9naW4gfHwgJy8nKVxuICAgIH1cbiAgfVxufSJdfQ==
