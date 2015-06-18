/*
 *Player
*/
(function (ns) {

    ns.Player = function (x, y,level) {
        ns.Entity.call(this, x, y);
        this.fov = 60;
        this.rot = 90;
        this.rotz = 0;
        this.speed = 2;
        this.lastrot = 0;
        this.level = level;
    }

    Alistuff.ext(ns.Player, ns.Entity, {
        update: function (time) {
            this.move(time);
        },

        move: function (time) {
            var newx = this.vx  + this.x;
            var newy = this.vy + this.y;
  
            var ix = Math.floor(newx / this.level.gridSize);
            var iy = Math.floor(newy / this.level.gridSize);

            if (!this.level.isBlock(ix, iy)) {
                this.x = newx;
                this.y = newy;
                this.level.triggerEvent(ix,iy);
            }
      
            if (Math.abs(this.vx) > 0.01)
                this.vx *= 0.6;
            else
                this.vx = 0;

            if (Math.abs(this.vy) > 0.01)
                this.vy *= 0.6;
            else
                this.vy = 0;
        },

        turnLeft: function () {
            this.vx = Math.cos(this.rot * Math.PI / 180 + Math.PI / 2) * this.speed;
            this.vy = -Math.sin(this.rot * Math.PI / 180 + Math.PI / 2) * this.speed;
        },

        turnRight: function () {
            this.vx = Math.cos(this.rot * Math.PI / 180 - Math.PI / 2) * this.speed;
            this.vy = -Math.sin(this.rot * Math.PI / 180 - Math.PI / 2) * this.speed;
        },

        turnUp: function () {
            this.vx = Math.cos(this.rot * Math.PI / 180) * this.speed;
            this.vy = -Math.sin(this.rot * Math.PI / 180) * this.speed;
        },

        turnDown: function () {
            this.vx = -Math.cos(this.rot * Math.PI / 180) * this.speed;
            this.vy = Math.sin(this.rot * Math.PI / 180) * this.speed;
        },

        rotateLeft: function () {
            this.rotate(this.speed);
        },

        rotateRight: function () {
            this.rotate(-this.speed);
        },

        lookAround:function(x,y,width,height){
            this.rotate(this.lastrot-x);
            this.lastrot = x;
            this.rotz = y - height / 2;
        },
    });

})(Alistuff.fps.entities);