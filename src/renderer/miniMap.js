(function (ns) {

    ns.Camera = function (width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
    }

    ns.Camera.prototype = {

        lookAt: function (x, y) {
            this.x = x - this.width / 2;
            this.y = y - this.height / 2;
        },

    };

    ns.MiniMap = function () {
        this.level = undefined;
        this.rayCaster = undefined;
        this.camera = undefined;
        this.scale = undefined;
        this.x = 0;
        this.y = 0;
        this.width = undefined;
        this.height = undefined;
        this.type = ns.MiniMap.MAP_TYPE_RECTANGLE;
    }

    ns.MiniMap.MAP_TYPE_RECTANGLE = 1;
    ns.MiniMap.MAP_TYPE_ARC = 2;

    ns.MiniMap.prototype = {

        init: function (x, y, rayCaster, camera, scale) {
            this.x = x;
            this.y = y;
            this.level = rayCaster.level;
            this.rayCaster = rayCaster;
            this.camera = camera;
            this.scale = scale || 1;
            this.width = camera.width * this.scale;
            this.height = camera.height * this.scale;
        },

        setType: function (type) {
            this.type = type;
        },

        render: function (context) {
            context.save();

            var hw = this.width / 2;
            var hh = this.height / 2;
            var cx = this.camera.x;
            var cy = this.camera.y;
            var cw = this.camera.width;
            var ch = this.camera.height;     
            var gridSize = this.level.gridSize;
            var playerAngle = this.level.player.rot;

            var cameraMinX = Math.floor(cx / gridSize);
            var cameraMaxX = Math.floor((cx + cw) / gridSize);
            var cameraMinY = Math.floor(cy / gridSize);
            var cameraMaxY = Math.floor((cy + ch) / gridSize);

            context.beginPath();
            context.translate(this.x, this.y);
            context.rotate((playerAngle - 90) * Math.PI / 180);

            if (this.type === ns.MiniMap.MAP_TYPE_RECTANGLE) {
                context.rect(-hw, -hh, this.width, this.height);
            } else if (this.type === ns.MiniMap.MAP_TYPE_ARC) {
                context.arc(0, 0, hw, 0, Math.PI * 2, false);
            }
            context.clip();
            context.closePath();

            for (var y = cameraMinY; y <= cameraMaxY; y++) {
                for (var x = cameraMinX; x <= cameraMaxX; x++) {
                    var dx = (x * gridSize - cx) * this.scale - hw;
                    var dy = (y * gridSize - cy) * this.scale - hh;   
                    context.fillStyle = this.level.isBlock(x, y) ? 'rgba(10,10,10,0.3)' : 'rgba(200,200,200,0.3)';
                    context.fillRect(dx, dy, gridSize * this.scale, gridSize * this.scale);
                }
            }

            context.fillStyle = 'rgba(0,0,255,0.3)';
            context.beginPath();
            context.arc(0, 0, gridSize * this.scale, 0, Math.PI * 2, false);
            context.fill();
            
            var i = 0;
            var rays = this.rayCaster.rays;
            var ray = null;
            context.fillStyle = 'rgba(255,255,255,0.4)';
            context.beginPath();
            for (; i < rays.length; i++) {
                ray = rays[i];
                if (ray != null) {
                    context.moveTo((ray.x0 - cx) * this.scale - hw,
                        (ray.y0 - cy) * this.scale - hh);
                    break;
                }
            }

            for (; i < rays.length; i++) {
                ray = rays[i];
                if (ray != null) {
                    context.lineTo((ray.x1 - cx) * this.scale - hw,
                        (ray.y1 - cy) * this.scale - hh);
                }
            }

            context.closePath();
            context.fill();

            var keyEvents = this.level.keyEvents;
            if (keyEvents) {
                var randomLight = (120 + 50 - Math.random() * 100) / 240 * 100 + '%';
                for (i = 0; i < keyEvents.length; i++) {
                    var eventId = keyEvents[i];
                    var dx = (eventId % this.level.width * gridSize + gridSize / 2 - cx) * this.scale - hw;
                    var dy = (eventId / this.level.width * gridSize + gridSize / 2 - cy) * this.scale - hh;

                    context.fillStyle = 'hsla(' + i * 20 + ',80%,' + randomLight + ',0.3)';
                    context.beginPath();
                    context.arc(dx, dy, gridSize * this.scale, 0, Math.PI * 2, false);
                    context.fill();
                }
            }
            context.restore();
        },
    };

})(Alistuff.fps.renderer);