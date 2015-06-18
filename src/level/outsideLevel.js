/*
 * OutsideLevel
*/
(function (lv, et) {
    lv.OutsideLevel = function (gameState) {
        lv.Level.call(this);
        this.gridSize = 32;
        //this.init(gameState.game.getTexture('outsideLevel'));
        this.init(lv.MAP_OUTSIDE);
        this.events = [
            { event: 21 * this.width + 27, excute: function () { gameState.nextLevel(); }}
        ];
    }

    Alistuff.ext(lv.OutsideLevel, lv.Level, {
        decorateGrid: function (x, y, dx, dy, col) {
            var entity = undefined;
            
            if (col === 0xB5E61D) {
                var random = Math.random();
                if (random < 0.5) {
                    entity = new et.Flower(dx, dy);
                }
                else{
                    entity = new et.Tree(dx, dy);
                    entity.height = Math.random() * 50 + entity.height;
                }
            }

            if (col === 0x22B14C) {
                entity = new et.Tree(dx, dy);
                entity.width = entity.width * 3;
                entity.height = entity.height * 4;
            }

            if (col === 0x99D9EA) {
                entity = new et.Cloud(dx, dy);
            }

            if (col === 0xFF0101) {
                this.spawnX = dx;
                this.spawnY = dy;
                this.setGrid(x, y, 0xffffff);
            }

            if (entity) {
                this.setGrid(x, y, 0xffffff);
            }

            return entity;
        },

        getWall: function (x, y) {
            var col = this.getGrid(x, y);

            if (col === 0x000000) return 'wall2';
            if (col === 0x880015) return 'wall2_water';

            return undefined;
        },

        isBlock: function (x, y) {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height)
                return true;
            var col = this.getGrid(x, y);
            return col !== 0xffffff;
        },
    });

})(Alistuff.fps.level,Alistuff.fps.entities);