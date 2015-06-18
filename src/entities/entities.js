/*
 *Entities
*/
(function (ns) {
    //entity
    ns.Entity = function (x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.rot = 0;
        this.rotz = 0;
        this.speed = 0;
        this.tex = undefined;
        this.width = undefined;
        this.height = undefined;
        this.level = undefined;
        this.alive = true;
        this.col = 'rgb(0,0,255)';
    }

    ns.Entity.prototype = {
        update: function (deltaTime) { },
        move: function (deltaTime, blockCallback) {

            var angle = this.rot * Math.PI / 180;
            this.vx = Math.cos(angle) * this.speed * deltaTime;
            this.vy = -Math.sin(angle) * this.speed * deltaTime;

            var newx = this.x + this.vx;
            var newy = this.y + this.vy;

            if (!this.level.isBlock(Math.floor(newx / this.level.gridSize),
                Math.floor(newy / this.level.gridSize))) {
                this.x = newx;
                this.y = newy;
            }
            else {
                blockCallback && blockCallback.call(this);
            }
        },
        rotate: function (value) {
            this.rot += value;
            this.rot = (this.rot % 360 + 360) % 360;
        },
        collide: function (entity) {
            return false;
        },
    };

    //enemy
    ns.Enemy = function (x, y) {
        ns.Entity.call(this, x, y);
        this.x = x;
        this.y = y;
        this.hp = 100;
    }

    Alistuff.ext(ns.Enemy, ns.Entity, {
        update: function (deltaTime) {
            if (Math.random()<0.01) {
                this.rotate(Math.random() * 360);
            }

            //weapon version
            //if (Math.random() < 0.01) {
            //    var dx = this.level.player.x - this.x;
            //    var dy = this.level.player.y - this.y;
            //    var alpha = -Math.atan2(dy, dx) * 180 / Math.PI;
            //    alpha = (alpha % 360 + 360) % 360;
            //    var offsetAngle = alpha - this.rot;
            //    var testAngle = Math.min(Math.abs(offsetAngle), 360 - Math.abs(offsetAngle));
            //    if (testAngle <= this.level.player.fov / 2) {
            //        this.rotate(offsetAngle /*+ (5 - Math.random() * 10)*/);
            //    }         
            //}

            this.move(deltaTime,function () { this.rotate(this.rot + 90 - Math.random() * 180); });
        },

        hurt: function (dam) {
            this.hp -= dam;
            if (this.hp < 0) {
                this.hp = 0;
                this.alive = false;
            }
        },
    });

    ns.Html5Enemy = function (x, y) {
        ns.Enemy.call(this, x, y);
        this.tex = 'enemy_html5';
        this.width = 16;
        this.height = 16;
        this.speed = 10;
    }

    Alistuff.ext(ns.Html5Enemy, ns.Enemy);

    ns.JavaEnemy = function (x, y) {
        ns.Enemy.call(this, x, y);
        this.tex = 'enemy_java';
        this.width = 16;
        this.height = 16;
        this.rotz = -8;
        this.speed = 10;
    }

    Alistuff.ext(ns.JavaEnemy, ns.Enemy);

    ns.AndroidEnemy = function (x, y) {
        ns.Enemy.call(this, x, y);
        this.tex = 'enemy_android';
        this.width = 8;
        this.height = 8;
        this.speed = 5;
    }

    Alistuff.ext(ns.AndroidEnemy, ns.Enemy);

    ns.SkullEnemy = function (x, y) {
        ns.Enemy.call(this, x, y);
        this.tex = 'enemy_skull';
        this.width = 16;
        this.height = 30;
    }

    Alistuff.ext(ns.SkullEnemy, ns.Enemy);

    ns.GhostEnemy = function (x, y) {
        ns.Enemy.call(this, x, y);
        this.width = 15;
        this.height = 25;
        this.tex = 'enemy_ghost';
        this.rotz = 2;
        this.speed = 30;
    }

    Alistuff.ext(ns.GhostEnemy, ns.Enemy, {
        update: function (deltaTime) {

            var dx = this.level.player.x - this.x;
            var dy = this.level.player.y - this.y;
            var dd = Math.sqrt(dx * dx + dy * dy);
            var mindistance = this.level.gridSize * 0.5;

            if (dd > mindistance && !this.level.isOutOfMap(this.x, this.y)) {
                
                this.rot = Math.atan2(-dy, dx) * 180 / Math.PI;
                this.move(deltaTime, function () {
                    this.alive = false;
                });

            } else {
                this.alive = false;
            }
        },
    });

    //item
    ns.Chair = function (x, y) {
        ns.Entity.call(this, x, y);
        this.width = 16;
        this.height = 20;
        this.rotz = 10;
        this.tex = 'item_chair';
    }

    Alistuff.ext(ns.Chair, ns.Entity);

    ns.Table = function (x, y) {
        ns.Entity.call(this, x, y);
        this.width = 50;
        this.height = 24;
        this.rotz = 15;
        this.tex = 'item_table';
    }

    Alistuff.ext(ns.Table, ns.Entity);

    ns.Computer = function (x, y) {
        ns.Entity.call(this, x, y);
        this.width = 20;
        this.height = 10;
        this.rotz = 15;
        this.tex = 'item_computer';
    }

    Alistuff.ext(ns.Computer, ns.Entity);

    ns.Skull = function (x, y) {
        ns.Entity.call(this, x, y);
        this.width = 10;
        this.height = 15;
        this.rotz = 5;
        this.tex = 'item_skull';
    }

    Alistuff.ext(ns.Skull, ns.Entity);

    ns.Tree = function (x, y) {
        ns.Entity.call(this, x, y);
        this.width = 20;
        this.height = 32;
        this.tex = 'item_tree';
    }

    Alistuff.ext(ns.Tree, ns.Entity);

    ns.Flower = function (x, y) {
        ns.Entity.call(this,x, y);
        var random = Math.random();
        if (random < 0.3) {
            this.width = 7;
            this.height = 8;
            this.tex = 'item_flower1';
        } else if (random < 0.6) {
            this.width = 7;
            this.height = 7;
            this.tex = 'item_flower2';
        } else {
            this.width = 20;
            this.height = 5;
            this.tex = 'item_flower3';
        }
    }

    Alistuff.ext(ns.Flower, ns.Entity);

    ns.Cloud = function (x, y) {
        ns.Entity.call(this, x, y);
        this.width = 30;
        this.height = 20;
        this.rotz = -100;
        this.tex = 'item_cloud';
    }

    Alistuff.ext(ns.Cloud, ns.Entity);

})(Alistuff.fps.entities);