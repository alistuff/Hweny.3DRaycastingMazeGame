/*
 * DungeonLevel
*/
(function (lv, et) {
    lv.DungeonLevel = function (gameState) {
        lv.Level.call(this);

        this.gridSize = 32;
        //this.init(gameState.game.getTexture('dungeonLevel'));
        this.init(lv.MAP_DUNGEON);
        var bgm = gameState.playSound('Dungeon Ambient',true);;

        function addGhost(x, y) {
            this.addEntity(new et.GhostEnemy(
                x * this.gridSize + this.gridSize / 2, y * this.gridSize + this.gridSize / 2));
            gameState.playSound('Zombie Pain');
        };

        function openDoor(x, y) {
            this.setGrid(x, y, 0xffffff);
            gameState.playSound('Dark Long Hits');
        };

        function nextLevel() {
            gameState.fadeOut(3, 0x000000, function () {
                gameState.nextLevel();
            })
        };
       
        this.events = [
            { event: 98 * this.width + 13, excute: function () { gameState.fadeIn(10); } },
            { event: 96 * this.width + 13, excute: function () { gameState.textFadeInOut("我不知身在何处", 180, 100, 2, 0.5); } },
            { event: 87 * this.width + 13, excute: function () { gameState.textFadeInOut("我只能在黑暗中前行", 180, 120, 3, 1);  } },
            { event: 68 * this.width + 13, excute: function () { gameState.textFadeInOut("我无数次碰壁", 180, 120, 3, 1); gameState.playSound('Horror Ambient'); } },
            { event: 45 * this.width + 19, excute: function () { gameState.textFadeInOut("我走了许多弯路", 180, 120, 3, 1); gameState.playSound('Horror Ambient'); } },
            { event: 79 * this.width + 21, excute: function () { gameState.playSound('Horror Ambient'); } },
            { event: 39 * this.width + 11, excute: function () { gameState.textFadeInOut("我碰到许多险恶", 180, 120, 3, 1); } },
            { event: 17 * this.width + 8, excute: function () { gameState.textFadeInOut("我拼命逃离", 100, 80, 2, 0); } },
            { event: 16 * this.width + 11, excute: function () { gameState.textFadeInOut("我逃离黑暗", 180, 120, 2, 0); } },
            { event: 13 * this.width + 15, excute: function () { gameState.textFadeInOut("我逃离恐惧", 100, 80, 2, 0); } },
            { event: 9 * this.width + 15, excute: function () { gameState.textFadeInOut("我逃离封闭", 280, 220, 2, 0); } },
            { event: 87 * this.width + 7, excute: function () { openDoor.call(this,5, 82); openDoor.call(this,21, 79); } },
            { event: 29 * this.width + 22, excute: function () { openDoor.call(this, 14, 39); gameState.playSound('Evil Chanting'); } },
            { event: 20 * this.width + 19, excute: function () { openDoor.call(this,10, 19); } },
            { event: 58 * this.width + 3, excute: function () { addGhost.call(this, 6, 57); } },
            { event: 76 * this.width + 1, excute: function () { addGhost.call(this, 1, 81); } },
            { event: 41 * this.width + 25, excute: function () { addGhost.call(this, 28, 41); } },
            { event: 18 * this.width + 22, excute: function () { addGhost.call(this, 22, 15); } },
            {
                event: 3 * this.width + 15, excute: function () {
                    gameState.stopSound(bgm);
                    gameState.playSound('Dark Long Hits');
                    gameState.textFadeInOut("我向往光明", 180, 120, 2, 0, 0xffffff, nextLevel);
                }
            }
        ];

        this.keyEvents = [
            87 * this.width + 7,
            29 * this.width + 22,
            20 * this.width + 19,
            3 * this.width + 15
        ];
    }

    Alistuff.ext(lv.DungeonLevel, lv.Level, {

        decorateGrid: function (x, y, dx, dy, col) {
            var entity = undefined;

            if (col === 0xff00ff) {
                var random = Math.random();
                if (random <= 0.3)
                    entity= new et.AndroidEnemy(dx, dy);
                else if (random <= 0.6)
                    entity = new et.JavaEnemy(dx, dy);
                else
                    entity = new et.Html5Enemy(dx, dy);
            }

            if (col === 0xA349A4) entity = new et.SkullEnemy(dx, dy);
            if (col === 0x00A2E8) entity = new et.Skull(dx, dy);
            if (col === 0x808000) entity = new et.Table(dx, dy);
            if (col === 0x80800A) entity = new et.Chair(dx, dy);
            if (col === 0x808014) entity = new et.Computer(dx, dy);

            if (col === 0xFF0101) {
                this.spawnX = dx;
                this.spawnY = dy;
                this.setGrid(x, y, 0xffffff);
            }

            if (entity) {
                this.setGrid(x, y, col === 0xA349A4 ? 0xA349A4 : 0xffffff);
            }

            return entity;
        },

        getWall: function (x, y) {
            var col = this.getGrid(x, y);

            if (col === 0x000000) return 'wall0';
            if (col === 0xFFAEC9) return 'wall0_blood';
            if (col === 0xC3C3C3) return 'wall0_cage';
            if (col === 0x7F7F7F) return 'wall0_door';
            if (col === 0x0000ff) return 'wall0_einstein';
            if (col === 0x408080) return 'wall0_msg';
            if (col === 0xEFE4B0) return 'wall0_radiator';
            if (col === 0xff0000) return 'wall0_russell';
            if (col === 0xFFC90E) return 'wall0_sign';
          //  if (col === 0x00ff00) return 'wall0_wittgenstein'; 
            if (col === 0x880015) return 'wall1';
            if (col === 0x7092BE) return 'wall1_crack';
            if (col === 0x22B14C) return 'wall1_hole';
            if (col === 0xB5E61D) return 'wall1_lamp';
            if (col === 0x99D9EA) return 'wall1_window';
            if (col === 0x00ff00) return 'wall1_wittgenstein';

            return 'wall0';
        },

        getFloor: function (x, y) {
            var col = this.getGrid(x, y);
            if (col === 0xA349A4) return 'floor0_blood';
            return 'floor0';
        },

        getCeiling: function (x, y) {
            if (x >= 19 && x <= 27 && y >= 24 && y <= 33) return 'ceiling1';
            if (x >= 15 && x <= 29 && y >= 33 && y <= 42) return 'ceiling1';
            if (x >= 21 && x <= 29 && y >= 42 && y <= 51) return 'ceiling1';
            return 'ceiling0';
        },

        isBlock:function(x,y){
            if (x < 0 || x >= this.width || y < 0 || y >= this.height)
                return true;
            var col = this.getGrid(x, y);
            return col !== 0xffffff && col !== 0xA349A4;
        },

    });

})(Alistuff.fps.level,Alistuff.fps.entities);