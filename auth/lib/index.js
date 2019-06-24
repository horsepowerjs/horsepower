"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@red5/server");
const path = require("path");
class default_1 extends server_1.Plugin {
    boot() {
        this.loadRoutes(path.join(__dirname, './routes'));
        this.loadControllers(path.join(__dirname, './controllers'));
    }
}
exports.default = default_1;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFxQztBQUVyQyw2QkFBNEI7QUFFNUIsZUFBcUIsU0FBUSxlQUFNO0lBQzFCLElBQUk7UUFDVCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUE7UUFDakQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFBO0lBQzdELENBQUM7Q0FDRjtBQUxELDRCQUtDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGx1Z2luIH0gZnJvbSAnQHJlZDUvc2VydmVyJ1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIGV4dGVuZHMgUGx1Z2luIHtcbiAgcHVibGljIGJvb3QoKSB7XG4gICAgdGhpcy5sb2FkUm91dGVzKHBhdGguam9pbihfX2Rpcm5hbWUsICcuL3JvdXRlcycpKVxuICAgIHRoaXMubG9hZENvbnRyb2xsZXJzKHBhdGguam9pbihfX2Rpcm5hbWUsICcuL2NvbnRyb2xsZXJzJykpXG4gIH1cbn1cbiJdfQ==
