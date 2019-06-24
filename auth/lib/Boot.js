"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@red5/server");
const path = require("path");
class default_1 extends server_1.Plugin {
    boot() {
        this.loadRoutes(path.join(__dirname, './routes'));
    }
}
exports.default = default_1;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Cb290LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQXFDO0FBRXJDLDZCQUE0QjtBQUU1QixlQUFxQixTQUFRLGVBQU07SUFDMUIsSUFBSTtRQUNULElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQTtJQUNuRCxDQUFDO0NBQ0Y7QUFKRCw0QkFJQyIsImZpbGUiOiJCb290LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGx1Z2luIH0gZnJvbSAnQHJlZDUvc2VydmVyJ1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIGV4dGVuZHMgUGx1Z2luIHtcbiAgcHVibGljIGJvb3QoKSB7XG4gICAgdGhpcy5sb2FkUm91dGVzKHBhdGguam9pbihfX2Rpcm5hbWUsICcuL3JvdXRlcycpKVxuICB9XG59Il19
