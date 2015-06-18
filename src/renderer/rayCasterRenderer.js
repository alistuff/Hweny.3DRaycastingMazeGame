/*
 *renderer
*/
(function (ns) {

    ns.BaseRenderer = function () { }
    ns.BaseRenderer.prototype = {
        render: function (context, raycaster) { },
    };

    ns.StrokeRenderer = function () { }
    Alistuff.ext(ns.StrokeRenderer, ns.BaseRenderer, {
        render: function (context, raycaster) {
            
            var x = raycaster.x;
            var y = raycaster.y;
            var width = raycaster.width;
            var height = raycaster.height;
            var rotz = raycaster.rotz;
            var projections = raycaster.projections;
            
            //draw sky
            context.fillStyle = 'skyblue';
            context.fillRect(x, y, width, rotz);

            //draw floor
            context.fillStyle = 'gray';
            context.fillRect(x, y + rotz, width, height - rotz);
            context.lineWidth = 2.5;

            for (var i = 0; i < projections.length; i++) {
                var projection = projections[i];
                if (projection != null) {
                    if (projection.length < 1) continue;
                    var light = (Math.min(1, projection.length / height)) * 255;
                    context.strokeStyle = 'hsl(200,70%,' + light / 255 * 50 + '%)';
                    context.beginPath();
                    context.moveTo(x+projection.x, y+projection.y);
                    context.lineTo(x + projection.x, y+projection.y + projection.length);
                    context.stroke();
                }
            }

            var entitiesProjections = raycaster.getEntitiesProjections();
            for (var i = 0; i < entitiesProjections.length; i++) {
                var ep = entitiesProjections[i];
                var entity = ep.entity;
                if (entity.tex) {
                    var texture = raycaster.game.getImage(entity.tex);
                    var scalew = texture.width / ep.projectionWidth;
                    var scaleh = texture.height / ep.projectionHeight;
                    var ps = ep.projections;

                    for (var j = 0; j < ps.length; j++) {
                        var proj = ps[j];
                        if (proj.length < 1) continue;
                        context.drawImage(texture,
                            Math.floor(proj.offset * scalew), 0, 1, Math.floor(proj.length * scaleh),
                            proj.x + x, proj.y + y, 1, proj.length);
                    }
                }
            }
        }
    });

    ns.TextureRenderer = function () { }
    Alistuff.ext(ns.TextureRenderer, ns.BaseRenderer, {
        render: function (context, raycaster) {
            var x = raycaster.x;
            var y = raycaster.y;
            var width = raycaster.width;
            var height = raycaster.height;
            var rotz = raycaster.rotz;
            var rays = raycaster.rays;
            var projections = raycaster.projections;
            var level = raycaster.level;

            //draw sky
            this.render_sky(context, x, y, width, rotz);
            //draw floor
            this.render_floor(context, x, y + rotz, width, height - rotz);
            
            for (var i = 0, j = projections.length; i < j; i++) {
                var projection = projections[i];
                if (projection != null) {
                    if (projection.length < 1) continue;
                    var ray = projection.ray;
                    var ix = Math.floor((ray.x1) / level.gridSize);
                    var iy = Math.floor((ray.y1) / level.gridSize);
                    var wall = level.getWall(ix, iy);
                    var texture = raycaster.game.getImage(wall);
                    context.drawImage(texture,
                        ray.offset * texture.width / level.gridSize, 0, 1, texture.height,
                        x + projection.x, y+projection.y, 1, projection.length);
                }
            }


            //render entities
            var entitiesProjections = raycaster.getEntitiesProjections();
            for (var i = 0; i < entitiesProjections.length; i++) {
                var ep = entitiesProjections[i];
                var entity = ep.entity;
                if (entity.tex) {
                    var texture = raycaster.game.getImage(entity.tex);
                    var scalew = texture.width / ep.projectionWidth;
                    var scaleh = texture.height / ep.projectionHeight;
                    var ps = ep.projections;
                    for (var j = 0; j < ps.length; j++) {
                        var proj = ps[j];
                        if (proj.length < 1) continue;
                        context.drawImage(texture,
                            Math.floor(proj.offset * scalew), 0, 1,Math.floor(proj.length * scaleh),
                            proj.x + x, proj.y + y, 1, proj.length);
                    }
                }
            }
        },

        render_sky: function (context, x,y,width,height) {
            context.fillStyle = 'skyblue';
            context.fillRect(x, y, width, height);
        },

        render_floor: function (context, x, y, width, height) {
            context.fillStyle = 'rgb(192,192,192)';
            context.fillRect(x, y, width, height);
        },
    });

    ns.PerPixelRenderer = function () { }

    Alistuff.ext(ns.PerPixelRenderer, ns.BaseRenderer, {

        render: function (context, raycaster) {

            var x = raycaster.x;
            var y = raycaster.y;
            var width = raycaster.width;
            var height = raycaster.height;
            var rotz = raycaster.rotz;
            var rays = raycaster.rays;
            var projections=raycaster.projections;
            var level = raycaster.level;

            var imagedata = context.getImageData(x, y, width, height);
            var buffer = imagedata.data;
            var fx = imagedata.width / width;
            var fy = imagedata.height / height;

            var lightness = 90;

            //render wall
            for (var i = 0; i < projections.length; i++) {
                var proj = projections[i];      
                var start, end;
                var ix, iy, scaleX, scaleY;
                var wall, floor, ceiling;
                var rayAngle = (width / 2 - i) * raycaster.dtAnglePerProjection;

                if (proj != null) {
                  
                    ix = Math.floor(proj.ray.x1 / level.gridSize);
                    iy = Math.floor(proj.ray.y1 / level.gridSize);

                    wall = raycaster.game.getTexture(level.getWall(ix, iy));

                    scaleX = wall.width / level.gridSize;
                    scaleY = wall.height / proj.length;

                    start = proj.y;
                    end = proj.y + proj.length;

                    var light = 1 - Math.max(0, Math.min(1, proj.ray.length / lightness));

                    for (var j = Math.max(0, Math.floor(start)), k = Math.min(Math.floor(end), height) ; j <= k; j++) {

                        ix = proj.ray.offset * scaleX;
                        iy = (j - Math.floor(proj.y)) * scaleY;

                        var col = wall.getPixel(ix % wall.width, iy % wall.height);

                        var index = Math.floor(j * imagedata.width * fy + i * fx) << 2;
                        buffer[index] = col.r * light;
                        buffer[index + 1] = col.g * light;
                        buffer[index + 2] = col.b * light;
                        buffer[index + 3] = col.a;
                    }
                }
      
                //render floor ceiling
                for (var j = 0; j < height; j++) {

                    if (start && end && j > start && j < end) continue;

                    var distViewerToFloor = Math.abs(raycaster.distanceViewerToPlane * level.player.height /
                        (j - rotz) / Math.cos(rayAngle * PI_DIV_180));

                    var angle = (level.player.rot + rayAngle) * PI_DIV_180;
                    var floorX = level.player.x + Math.cos(angle) * distViewerToFloor;
                    var floorY = level.player.y - Math.sin(angle) * distViewerToFloor;

                    ix = Math.floor(floorX / level.gridSize);
                    iy = Math.floor(floorY / level.gridSize);

                    floor = raycaster.game.getTexture(level.getFloor(ix, iy));
                    ceiling = raycaster.game.getTexture(level.getCeiling(ix, iy));

                    var col;
                    if (j > rotz) {
                        ix = floorX % level.gridSize * floor.width / level.gridSize;
                        iy = floorY % level.gridSize * floor.height / level.gridSize;
                        col = floor.getPixel(ix % floor.width, iy % floor.height);
                    }
                    else {
                        ix = floorX % level.gridSize * ceiling.width / level.gridSize;
                        iy = floorY % level.gridSize * ceiling.height / level.gridSize;
                        col = ceiling.getPixel(ix % ceiling.width, iy % ceiling.height);
                    }

                    var light = 1 - Math.max(0, Math.min(1, distViewerToFloor / lightness));

                    var index = Math.floor(j * imagedata.width * fy + i * fx) << 2;
                    buffer[index] = col.r * light;
                    buffer[index + 1] = col.g * light;
                    buffer[index + 2] = col.b * light;
                    buffer[index + 3] = col.a;
                }
            }

            //render entities
            var entitiesProjections = raycaster.getEntitiesProjections();
            for (var i = 0; i < entitiesProjections.length; i++) {
                var ep = entitiesProjections[i];
                var entity = ep.entity;
                if (entity.tex) {
                    var texture = raycaster.game.getTexture(entity.tex);
                    var scalew = texture.width / ep.projectionWidth;
                    var scaleh = texture.height / ep.projectionHeight;
                    var ps = ep.projections;
                    var dist = Math.sqrt((entity.x - level.player.x) * (entity.x - level.player.x) + (entity.y - level.player.y) * (entity.y - level.player.y));
                    var light = 1 - Math.max(0, Math.min(1, dist / lightness));
                    for (var j = 0; j < ps.length; j++) {
                        var proj = ps[j];

                        for (var k = Math.floor(proj.y) ; k < Math.floor(proj.y + proj.length) ; k++) {

                            if (k < 0 || k >= height) continue;

                            var col = texture.getPixel(proj.offset * scalew, (k - Math.floor(proj.y)) * scaleh);
                            var index = Math.floor(k * imagedata.width * fy + proj.x * fx) << 2;
                            var sa = col.a / 255;
                            var da = buffer[index + 3] / 255;
                            var alpha = sa + da * (1 - sa);
                            buffer[index+0] = (col.r * sa * light + buffer[index+0] * da * (1 - sa)) / alpha;
                            buffer[index+1] = (col.g * sa * light + buffer[index+1] * da * (1 - sa)) / alpha;
                            buffer[index+2] = (col.b * sa * light + buffer[index+2] * da * (1 - sa)) / alpha;
                            buffer[index + 3] = alpha * 255;

                            //var alpha = col.a / 255;
                            //buffer[index] = (col.r * light) * alpha + (1 - alpha) * buffer[index];
                            //buffer[index + 1] = (col.g * light) * alpha + (1 - alpha) * buffer[index + 1];
                            //buffer[index + 2] = (col.b * light) * alpha + (1 - alpha) * buffer[index + 2];
                            //buffer[index + 3] = col.a * alpha + (1 - alpha) * buffer[index + 3];
                        }
                    }
                }
            }

            context.putImageData(imagedata, x, y);
        },
    });

})(Alistuff.fps.renderer);