"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@red5/server");
const mysql_1 = require("@red5/mysql");
const bcrypt = require("bcrypt");
class Auth extends mysql_1.Model {
    constructor(table) {
        super();
        this.$table = '';
        this.$table = table;
    }
}
class Login {
    constructor(client) {
        this.client = client;
        if (!this.client.session)
            throw new Error('The "Auth" package depends on sessions to work properly.');
        this.config = server_1.getConfig('auth');
    }
    get table() {
        return this.config && this.config.table || 'auth';
    }
    get idField() { return this.config && this.config.dbFields && this.config.dbFields.id || 'id'; }
    get userField() { return this.config && this.config.dbFields && this.config.dbFields.username || 'username'; }
    get passField() { return this.config && this.config.dbFields && this.config.dbFields.password || 'password'; }
    async login(username, password) {
        let row = await mysql_1.DB.table(this.table).where(this.userField, username).first();
        if (!row)
            return false;
        if (await bcrypt.compare(password, row[this.passField])) {
            if (!this.client.session)
                return false;
            this.client.session.set('auth.username', row[this.userField]);
            this.client.session.set('auth.id', row[this.idField]);
            return true;
        }
        return false;
    }
    async join(username, password) {
        let hash = await bcrypt.hash(password, 10);
        let auth = new Auth(this.table);
        auth.set(this.userField, username);
        auth.set(this.passField, hash);
        if (!await auth.exists(this.userField)) {
            return await auth.save();
        }
        return false;
        // let row = await DB.table(this.table).where(userField, username).first()
        // if (!row) return false
        // if (await bcrypt.compare(password, row[passField])) {
        //   if (!this.client.session) return false
        //   this.client.session.set('auth.username', row[userField])
        //   this.client.session.set('auth.id', row[idField])
        //   return true
        // }
        // return false
    }
    async logout() {
        this.client.session && (await this.client.session.destroy());
    }
}
exports.Login = Login;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QyxDQUFBO1FBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUM5QixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUN0QyxPQUFPLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO1NBQ3pCO1FBQ0QsT0FBTyxLQUFLLENBQUE7UUFDWiwwRUFBMEU7UUFDMUUseUJBQXlCO1FBQ3pCLHdEQUF3RDtRQUN4RCwyQ0FBMkM7UUFDM0MsNkRBQTZEO1FBQzdELHFEQUFxRDtRQUNyRCxnQkFBZ0I7UUFDaEIsSUFBSTtRQUNKLGVBQWU7SUFDakIsQ0FBQztJQUVNLEtBQUssQ0FBQyxNQUFNO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQzlELENBQUM7Q0FDRjtBQXRERCxzQkFzREMiLCJmaWxlIjoiaGVscGVycy9Mb2dpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENsaWVudCwgZ2V0Q29uZmlnIH0gZnJvbSAnQHJlZDUvc2VydmVyJ1xuaW1wb3J0IHsgREIsIE1vZGVsIH0gZnJvbSAnQHJlZDUvbXlzcWwnXG5pbXBvcnQgKiBhcyBiY3J5cHQgZnJvbSAnYmNyeXB0J1xuaW1wb3J0IHsgQXV0aFNldHRpbmdzIH0gZnJvbSAnLi4vcm91dGVzJ1xuXG5jbGFzcyBBdXRoIGV4dGVuZHMgTW9kZWwge1xuICBwcm90ZWN0ZWQgJHRhYmxlOiBzdHJpbmcgPSAnJ1xuICBwdWJsaWMgY29uc3RydWN0b3IodGFibGU6IHN0cmluZykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLiR0YWJsZSA9IHRhYmxlXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExvZ2luIHtcblxuICBwcml2YXRlIGNvbmZpZz86IEF1dGhTZXR0aW5nc1xuXG4gIHB1YmxpYyBnZXQgdGFibGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnICYmIHRoaXMuY29uZmlnLnRhYmxlIHx8ICdhdXRoJ1xuICB9XG5cbiAgcHVibGljIGdldCBpZEZpZWxkKCkgeyByZXR1cm4gdGhpcy5jb25maWcgJiYgdGhpcy5jb25maWcuZGJGaWVsZHMgJiYgdGhpcy5jb25maWcuZGJGaWVsZHMuaWQgfHwgJ2lkJyB9XG4gIHB1YmxpYyBnZXQgdXNlckZpZWxkKCkgeyByZXR1cm4gdGhpcy5jb25maWcgJiYgdGhpcy5jb25maWcuZGJGaWVsZHMgJiYgdGhpcy5jb25maWcuZGJGaWVsZHMudXNlcm5hbWUgfHwgJ3VzZXJuYW1lJyB9XG4gIHB1YmxpYyBnZXQgcGFzc0ZpZWxkKCkgeyByZXR1cm4gdGhpcy5jb25maWcgJiYgdGhpcy5jb25maWcuZGJGaWVsZHMgJiYgdGhpcy5jb25maWcuZGJGaWVsZHMucGFzc3dvcmQgfHwgJ3Bhc3N3b3JkJyB9XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBjbGllbnQ6IENsaWVudCkge1xuICAgIGlmICghdGhpcy5jbGllbnQuc2Vzc2lvbikgdGhyb3cgbmV3IEVycm9yKCdUaGUgXCJBdXRoXCIgcGFja2FnZSBkZXBlbmRzIG9uIHNlc3Npb25zIHRvIHdvcmsgcHJvcGVybHkuJylcbiAgICB0aGlzLmNvbmZpZyA9IGdldENvbmZpZzxBdXRoU2V0dGluZ3M+KCdhdXRoJylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBsb2dpbih1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgbGV0IHJvdyA9IGF3YWl0IERCLnRhYmxlKHRoaXMudGFibGUpLndoZXJlKHRoaXMudXNlckZpZWxkLCB1c2VybmFtZSkuZmlyc3QoKVxuICAgIGlmICghcm93KSByZXR1cm4gZmFsc2VcbiAgICBpZiAoYXdhaXQgYmNyeXB0LmNvbXBhcmUocGFzc3dvcmQsIHJvd1t0aGlzLnBhc3NGaWVsZF0pKSB7XG4gICAgICBpZiAoIXRoaXMuY2xpZW50LnNlc3Npb24pIHJldHVybiBmYWxzZVxuICAgICAgdGhpcy5jbGllbnQuc2Vzc2lvbi5zZXQoJ2F1dGgudXNlcm5hbWUnLCByb3dbdGhpcy51c2VyRmllbGRdKVxuICAgICAgdGhpcy5jbGllbnQuc2Vzc2lvbi5zZXQoJ2F1dGguaWQnLCByb3dbdGhpcy5pZEZpZWxkXSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGpvaW4odXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykge1xuXG4gICAgbGV0IGhhc2ggPSBhd2FpdCBiY3J5cHQuaGFzaChwYXNzd29yZCwgMTApXG5cbiAgICBsZXQgYXV0aCA9IG5ldyBBdXRoKHRoaXMudGFibGUpXG4gICAgYXV0aC5zZXQodGhpcy51c2VyRmllbGQsIHVzZXJuYW1lKVxuICAgIGF1dGguc2V0KHRoaXMucGFzc0ZpZWxkLCBoYXNoKVxuICAgIGlmICghYXdhaXQgYXV0aC5leGlzdHModGhpcy51c2VyRmllbGQpKSB7XG4gICAgICByZXR1cm4gYXdhaXQgYXV0aC5zYXZlKClcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gICAgLy8gbGV0IHJvdyA9IGF3YWl0IERCLnRhYmxlKHRoaXMudGFibGUpLndoZXJlKHVzZXJGaWVsZCwgdXNlcm5hbWUpLmZpcnN0KClcbiAgICAvLyBpZiAoIXJvdykgcmV0dXJuIGZhbHNlXG4gICAgLy8gaWYgKGF3YWl0IGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCByb3dbcGFzc0ZpZWxkXSkpIHtcbiAgICAvLyAgIGlmICghdGhpcy5jbGllbnQuc2Vzc2lvbikgcmV0dXJuIGZhbHNlXG4gICAgLy8gICB0aGlzLmNsaWVudC5zZXNzaW9uLnNldCgnYXV0aC51c2VybmFtZScsIHJvd1t1c2VyRmllbGRdKVxuICAgIC8vICAgdGhpcy5jbGllbnQuc2Vzc2lvbi5zZXQoJ2F1dGguaWQnLCByb3dbaWRGaWVsZF0pXG4gICAgLy8gICByZXR1cm4gdHJ1ZVxuICAgIC8vIH1cbiAgICAvLyByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBsb2dvdXQoKSB7XG4gICAgdGhpcy5jbGllbnQuc2Vzc2lvbiAmJiAoYXdhaXQgdGhpcy5jbGllbnQuc2Vzc2lvbi5kZXN0cm95KCkpXG4gIH1cbn0iXX0=
