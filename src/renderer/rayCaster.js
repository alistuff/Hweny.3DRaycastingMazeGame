//consts
var PI_DIV_180 = Math.PI / 180;
//
(function (ns) {
    ns.RayCaster = function () {

        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.distanceViewerToPlane = 0;
        this.dtAnglePerProjection = 0;

        this.rotz = 0;
        this.rays = [];
        this.projections = [];

        this.game = undefined;
        this.level = undefined;
        this.renderer = undefined;

        return this;
    };

    ns.RayCaster.prototype = {

        init: function (x, y, width, height, game, level, renderer) {

            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.distanceViewerToPlane = width / 2 / Math.tan(level.player.fov / 2 * PI_DIV_180);
            this.dtAnglePerProjection = level.player.fov / width;

            this.game = game;
            this.level = level;
            this.renderer = renderer;
        },

        cast: function (level,viewer) {
            var startAngle = viewer.rot + viewer.fov / 2;
            var adjustAngle = function (a) { return (a % 360 + 360) % 360; };
            var factor = this.dtAnglePerProjection;

            var rays = [];
            for (var i = 0; i < this.width; i++) {

                var hray = this.checkHorizontalIntersection(level, viewer.x, viewer.y, adjustAngle(startAngle));
                var vray = this.checkVerticalIntersection(level, viewer.x, viewer.y, adjustAngle(startAngle));

                if (hray != null && vray != null) {
                    var hdist = Math.abs((hray.x0 - hray.x1) / Math.cos(startAngle * PI_DIV_180));
                    var vdist = Math.abs((vray.x0 - vray.x1) / Math.cos(startAngle * PI_DIV_180));
                    if (hdist < vdist)
                        rays.push(hray);
                    else
                        rays.push(vray);
                } else if (hray != null) {
                    rays.push(hray);
                }
                else if (vray != null) {
                    rays.push(vray);
                } else {
                    rays.push(null);
                }

                startAngle -= factor;
            }

            return rays;
        },

        checkHorizontalIntersection: function (map, x, y, angle) {
            if (map.isOutOfMap(x, y)) {
                return null;
            }

            var faceUp = angle >= 0 && angle <= 180;
            var startX, startY = 0;

            if (faceUp)
                startY = Math.floor(y / map.gridSize) * map.gridSize - 0.1;
            else
                startY = Math.floor(y / map.gridSize) * map.gridSize + map.gridSize;
            startX = x + (y - startY) / Math.tan(angle * PI_DIV_180);

            var ya = faceUp ? -map.gridSize : map.gridSize;
            var xa = -ya / Math.tan(angle * PI_DIV_180);

            while (!map.isOutOfMap(startX, startY)) {
                if (map.isBlock(Math.floor(startX / map.gridSize), Math.floor(startY / map.gridSize)) ||
                    this.findCorner(map, x, y, startX, startY)) {
                    return {
                        x0: x,
                        y0: y,
                        x1: startX,
                        y1: startY,
                        offset: faceUp ? startX % map.gridSize : (map.gridSize - startX % map.gridSize),
                        length: Math.sqrt((x - startX) * (x - startX) + (y - startY) * (y - startY))
                    };
                }
                startX += xa;
                startY += ya;
            }

            return null;
        },

        checkVerticalIntersection: function (map, x, y, angle) {
            if (map.isOutOfMap(x, y)) {
                return null;
            }

            var faceLeft = angle >= 90 && angle <= 270;
            var startX, startY = 0;

            if (faceLeft)
                startX = Math.floor(x / map.gridSize) * map.gridSize - 0.1;
            else
                startX = Math.floor(x / map.gridSize) * map.gridSize + map.gridSize;
            startY = y + (x - startX) * Math.tan(angle * PI_DIV_180);

            xa = faceLeft ? -map.gridSize : map.gridSize;
            ya = -xa * Math.tan(angle * PI_DIV_180);

            while (!map.isOutOfMap(startX, startY)) {
                if (map.isBlock(Math.floor(startX / map.gridSize), Math.floor(startY / map.gridSize)) ||
                    this.findCorner(map, x, y, startX, startY)) {
                    return {
                        x0: x,
                        y0: y,
                        x1: startX,
                        y1: startY,
                        offset: faceLeft ? (map.gridSize-startY % map.gridSize) : startY % map.gridSize,
                        length: Math.sqrt((x - startX) * (x - startX) + (y - startY) * (y - startY))
                    };
                }
                startX += xa;
                startY += ya;
            }

            return null;
        },

        findCorner: function (map, x0, y0, x1, y1) {
            var dx = x0 - x1;
            var dy = y0 - y1;

            var ix = Math.floor(x1 / map.gridSize);
            var iy = Math.floor(y1 / map.gridSize);

            var tmpx = 0;
            var tmpy = 0;
            var result = false;

            //left up
            if (dx > 0 && dy > 0) {
                tmpx = ix + 1;
                tmpy = iy;

                result = tmpx < map.width && map.isBlock(tmpx, tmpy);

                tmpx = ix;
                tmpy = iy + 1;

                result = result && tmpy < map.height && map.isBlock(tmpx, tmpy);

                if (result) {
                    return true;
                }
            }

            //left bottom
            if (dx > 0 && dy < 0) {
                tmpx = ix + 1;
                tmpy = iy;

                result = tmpx < map.width && map.isBlock(tmpx, tmpy);

                tmpx = ix;
                tmpy = iy - 1;

                result = result && tmpy >= 0 && map.isBlock(tmpx, tmpy);

                if (result) {
                    return true;
                }
            }

            //right up
            if (dx < 0 && dy > 0) {
                tmpx = ix - 1;
                tmpy = iy;

                result = tmpx >= 0 && map.isBlock(tmpx, tmpy);

                tmpx = ix;
                tmpy = iy + 1;

                result = result && tmpy < map.height && map.isBlock(tmpx, tmpy);

                if (result) {
                    return true;
                }
            }

            //right bottom
            if (dx < 0 && dy < 0) {
                tmpx = ix - 1;
                tmpy = iy;

                result = tmpx >= 0 && map.isBlock(tmpx, tmpy);

                tmpx = ix;
                tmpy = iy - 1;

                result = result && tmpy >= 0 && map.isBlock(tmpx, tmpy);

                if (result) {
                    return true;
                }
            }

            return false;
        },

        calculateProjections: function (rays) {

            var halfWidth=this.width/2;
            var blockSize=this.level.gridSize;

            var projections = [];

            for (var i = 0, j = rays.length; i < j; i++) {
                var ray = rays[i];
                if (ray != null) {
                    var rayOffsetAngle = (halfWidth - i) * this.dtAnglePerProjection;
                    var distViewerToBlock = Math.abs(ray.length * Math.cos(rayOffsetAngle * PI_DIV_180));
                    var projection = this.distanceViewerToPlane / distViewerToBlock * blockSize;
                    var yOffset = this.rotz - projection / 2;

                    projections.push({
                        x:i,
                        y: yOffset,
                        length: projection,
                        ray: ray
                    });

                } else {
                    projections.push(null);
                }
            }

            return projections;
        },

        getEntitiesProjections: function () {

            var result = [];
            var entities = this.level.getVisibleEntities(this.level.player);
            var length=entities.length;
            var viewer=this.level.player;

            for (var i = 0; i < length; i++) {
                var entity = entities[i];
                var dx = entity.x - viewer.x;
                var dy = viewer.y-entity.y;
                var dd = Math.sqrt(dx * dx + dy * dy);
                var alpha = ((Math.atan2(dy, dx) * 180 / Math.PI) % 360 + 360) % 360;

                var offsetAngle = alpha - viewer.rot;
                if (Math.abs(offsetAngle) > viewer.fov / 2) {
                    if (offsetAngle > 0) offsetAngle = -Math.min(offsetAngle, 360 - offsetAngle);
                    else offsetAngle = Math.min(-offsetAngle, 360 + offsetAngle);
                }

                var cx = Math.floor(this.width / 2 - offsetAngle / this.dtAnglePerProjection);
                var distViewerToEntity = Math.abs(Math.cos(offsetAngle * PI_DIV_180) * dd);
                var scale =this.distanceViewerToPlane/distViewerToEntity;
                var pw = scale * entity.width;
                var ph = scale * entity.height;
                var pz = scale * this.level.gridSize;
                var iy = this.rotz - ph + pz / 2 + scale * entity.rotz;

                var ps = [];
                for (var j = 0; j < pw; j++) {
                    var ix = Math.floor(cx + j - pw / 2);
                    if (ix >= 0 && ix < this.width) {
                        var ray = this.rays[ix];
                        if (ray != null) {
                            var wallProjection = this.projections[ix];
                            if (dd < ray.length) {
                                ps.push({ x: ix, y: iy, length: ph, offset: j });
                            }
                            else if (wallProjection.y > iy) {
                                ps.push({
                                    x: ix, y: iy,
                                    length: Math.min(ph, Math.abs(iy - wallProjection.y)),
                                    offset: j
                                });
                            }  
                        }
                    }
                }

                result.push({
                    entity: entity,
                    projectionWidth: pw,
                    projectionHeight:ph,
                    projections: ps
                });
            }
            return result;
        },

        update: function (time) {
            this.rotz = this.height / 2 - this.level.player.rotz;
            this.rays = this.cast(this.level, this.level.player);
            this.projections = this.calculateProjections(this.rays);
        },

        render: function (context) {
            context.save();
            context.beginPath();
            context.rect(this.x, this.y, this.width, this.height);
            context.clip();
            context.closePath();
            this.renderer && this.renderer.render(context, this);
            context.restore();
        },
    };

})(Alistuff.fps.renderer);