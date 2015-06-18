/*
 *game level1
*/
(function (core, animation, lv, et, renderer) {

    //base game level state
    core.GameLevelState = function () {
        core.State.call(this);

        this.level = undefined;
        this.player = undefined;
        this.rayCaster = undefined;
        this.game = undefined;
        this.stage = new animation.Stage();
        this.font = '17px 微软雅黑';
    }

    Alistuff.ext(core.GameLevelState, core.State, {

        textFadeInOut: function (text, x, y, duration, stay, color, callback) {

            x = x || 0;
            y = y || 0;
            color = color || 0xffffff;

            var r = color >> 16 & 0xff;
            var g = color >> 8 & 0xff;
            var b = color & 0xff;

            var self = this;
            var actor = new animation.TextActor(text, function (context, actor) {
                context.save();
                context.fillStyle = actor.getRGBA();
                context.font = self.font;
                context.fillText(text, x, y);
                context.restore();
            }, x, y, r, g, b, 0);

            var time = this.stage.getElapsedTime();
            var endTime = time + duration * 2 + stay;
            actor.addAnimation(time, endTime, new animation.EmptyAnimation());
            actor.addAnimation(time, time + duration, new animation.AlphaAnimation(1));
            actor.addAnimation(time + duration + stay, endTime, new animation.AlphaAnimation(-1));

            this.stage.addActor(actor);
            this.makeAnimationCallback(endTime, callback);
        },

        fadeIn: function (duration, color, callback) {
            color = color || 0x000000;

            var r = color >> 16 & 0xff;
            var g = color >> 8 & 0xff;
            var b = color & 0xff;

            var actor = new animation.Actor(function (context, actor) {
                context.save();
                context.fillStyle = actor.getRGBA();
                context.fillRect(0, 0, context.canvas.width, context.canvas.height);
                context.restore();
            }, 0, 0, r, g, b, 1);

            var time = this.stage.getElapsedTime();
            actor.addAnimation(time, time + duration, new animation.AlphaAnimation(-1));
            this.stage.addActor(actor);
            this.makeAnimationCallback(time + duration, callback);
        },

        fadeOut: function (duration, color, callback) {
            color = color || 0x000000;

            var r = color >> 16 & 0xff;
            var g = color >> 8 & 0xff;
            var b = color & 0xff;

            var actor = new animation.Actor(function (context, actor) {
                context.save();
                context.fillStyle = actor.getRGBA();
                context.fillRect(0, 0, context.canvas.width, context.canvas.height);
                context.restore();
            }, 0, 0, r, g, b, 0);

            var time = this.stage.getElapsedTime();
            actor.addAnimation(time, time + duration, new animation.AlphaAnimation(1));
            this.stage.addActor(actor);
            this.makeAnimationCallback(time + duration, callback);
        },

        makeAnimationCallback: function (endTime, callback) {
            if (callback) {
                var callbackActor = new animation.Actor();
                callbackActor.addAnimation(endTime, endTime + 100, new animation.CallbackAnimation(callback, true));
                this.stage.addActor(callbackActor);
            }
        },

        nextLevel: function () { },

        playSound: function (file, loop) {
            //var url = 'res/snd/' + file + (this.game.canPlayOgg() ? '.ogg' : '.mp3');
            //return this.game.playSound(url, loop);
            return this.game.playSound(file, loop);
        },

        stopSound: function (audio) {
            return this.game.stopSound(audio);
        },
    });

    //game level1 quality selector
    core.GameMenuState = function () {
        core.State.call(this);
        this.game = undefined;
        this.selectedIndex = 0;
        this.title = '图形质量设置';
        this.menus = [
           '-最快：图像质量最差',
           '-较慢：图像质量较差',
           '-最慢：图像质量最好'
        ];

        this.font_big = '20px 微软雅黑';
        this.font_mid = '15.5px 微软雅黑';
        this.font_sml = '15px 微软雅黑';
    }

    Alistuff.ext(core.GameMenuState, core.State, {
        start: function (game) {
            this.game = game;
            var self = this;

            this.game.addKeyListener('up', function () {
                self.selectedIndex =(self.menus.length+(self.selectedIndex - 1)) % self.menus.length;
            });
            this.game.addKeyListener('down', function () {
                self.selectedIndex = (self.selectedIndex + 1) % self.menus.length;
            });
            this.game.addKeyListener('enter', function () {
                self.game.setState(new core.GameLevel1State(
                    core.GameLevel1State.QUALITY[self.selectedIndex]));
            });
        },

        end: function (game) {
            this.game.removeKeyListener('up');
            this.game.removeKeyListener('down');
            this.game.removeKeyListener('enter');
        },
        
        update: function (deltaTime) {

        },

        render: function (context) {
            context.save();
            context.fillStyle = '#000';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            context.fillStyle = '#fff';
            context.font = this.font_big;
            context.fillText(this.title, 20, 60);
         
            for (var i = 0; i < this.menus.length; i++) {
                var x = 40;
                var y = 100 + i * 30;
                if (i === this.selectedIndex) {
                    context.font = this.font_mid;
                    context.fillStyle = '#919191';
                    x += 30;
                } else {
                    context.font = this.font_sml;
                    context.fillStyle = '#fff';
                }
                context.fillText(this.menus[i], x, y);
            }

            context.fillStyle = '#fff';
            context.font = this.font_sml;
            context.fillText('[Enter 确认]', 350, 300);

            context.restore();
        },

        transitionRender: function (context) {
            context.save();
            context.fillStyle = '#000';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            context.restore();
        },

    });
	
    //game level1 state
    core.GameLevel1State = function (graphicsQuality) {
        core.GameLevelState.call(this);

        this.graphicsQuality = graphicsQuality || core.GameLevel1State.QUALITY_FAST;
		this.buffetContext = undefined;
		this.width = 480;
		this.height = 320;
		this.scale = 1;

		this.handX = 0;
		this.handY = 0;
		this.handWave = 0;

		this.miniMap = undefined;
		this.camera = undefined;
    }

    core.GameLevel1State.QUALITY_FAST = 0.33;
    core.GameLevel1State.QUALITY_SLOW = 0.67;
    core.GameLevel1State.QUALITY_GOOD = 1;

    core.GameLevel1State.QUALITY = [
        core.GameLevel1State.QUALITY_FAST,
        core.GameLevel1State.QUALITY_SLOW,
        core.GameLevel1State.QUALITY_GOOD
    ];

    Alistuff.ext(core.GameLevel1State, core.GameLevelState, {

        initGraphics: function (game) {
            if (this.graphicsQuality === core.GameLevel1State.QUALITY_GOOD) return;
            this.scale = this.graphicsQuality;
            var canvas = document.createElement('canvas');
            canvas.width = game.getWidth() * this.scale;
            canvas.height = game.getHeight() * this.scale;
            this.buffetContext = canvas.getContext('2d');
            this.width = canvas.width;
            this.height = canvas.height;
        },

        start: function (game) {
            this.game = game;
            this.level = new lv.DungeonLevel(this);
            this.player = new et.Player(this.level.spawnX, this.level.spawnY, this.level);
            this.player.height = this.level.gridSize / 2;
            this.player.speed = 2;
            this.level.player = this.player;

            this.initGraphics(game);
            this.rayCaster = new renderer.RayCaster();
            this.rayCaster.init(0, 0, this.width, this.height, game, this.level, new renderer.PerPixelRenderer());

            this.camera = new renderer.Camera(640, 640);
            this.miniMap = new renderer.MiniMap();
            this.miniMap.init(80, 80, this.rayCaster, this.camera, 0.2);
            this.miniMap.setType(renderer.MiniMap.MAP_TYPE_ARC);

            var self = this;
            game.addKeyListener('w', function () { self.player.turnUp(); });
            game.addKeyListener('s', function () { self.player.turnDown(); });
            game.addKeyListener('a', function () { self.player.turnLeft(); });
            game.addKeyListener('d', function () { self.player.turnRight(); });
            game.addKeyListener('q', function () { self.player.rotateLeft(); });
            game.addKeyListener('e', function () { self.player.rotateRight(); });
            game.addMouseListener('mousedown', function () { });

            if (game.supportPointerLock()) {
                var yy = 0;
                game.requestPointerLock(function (e) {
                    var client = game.windowToCanvas(e.x, e.y);
                    yy+=e.movementY;
                    if (yy < -50) yy = -50;
                    if (yy > game.getHeight()+50) yy = game.getHeight()+50;
               
                    self.player.lookAround(client.x, yy, game.getWidth(), game.getHeight());
                });
            }
            else {
                game.addMouseListener('mousemove', function (e) {
                    var client = game.windowToCanvas(e.clientX, e.clientY);
                    self.player.lookAround(client.x, client.y, game.getWidth(), game.getHeight());
                });
            }
        },

        end: function (game) {
            game.removeKeyListener('w');
            game.removeKeyListener('s');
            game.removeKeyListener('a');
            game.removeKeyListener('d');
            game.removeKeyListener('q');
            game.removeKeyListener('e');
            game.removeMouseListener('mousedown');
            game.removeMouseListener('mousemove');
            game.freePointerLock();
        },

        update: function (deltaTime) {
            this.player.update(deltaTime);
            this.level.update(deltaTime);
            this.rayCaster.update(deltaTime);
            this.stage.update(deltaTime);
            this.updateMyHand(deltaTime);
            this.camera.lookAt(this.player.x, this.player.y);
        },

        updateMyHand: function (deltaTime) {
            if (this.player.vx !== 0 || this.player.vy !== 0) {
                this.handWave += 1.5 * deltaTime;
                this.handX = Math.sin(this.handWave) * 25;
                this.handY = Math.sin(this.handWave) * 10;
            } else {
                this.handX = this.handX / 2;
                this.handY = this.handY / 2;
                this.handWave = 0;
            }
        },

        render: function (context) {
            this.rayCaster.render(this.buffetContext || context);
            if (this.buffetContext) {
                context.drawImage(this.buffetContext.canvas, 0, 0, context.canvas.width, context.canvas.height);
            }
            this.renderMyHand(context);
            this.stage.render(context);
            this.miniMap.render(context);
        },

        transitionRender: function (context) {
            context.save();
            context.fillStyle = '#000';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            context.restore();
        },

        renderMyHand: function (context) {
            var leftHand = this.game.getImage('left_hand');
            var rightHand = this.game.getImage('right_hand');
            var viewWidth = context.canvas.width;
            var viewHeight = context.canvas.height;

            context.drawImage(
			    leftHand,
				130 + this.handX / 4,
				viewHeight - leftHand.height * 0.45 + 45 - this.handY / 4,
			    leftHand.width * 0.45,
				leftHand.height * 0.45
		    );

            context.drawImage(
			    rightHand,
				viewWidth - rightHand.width * 0.5 + this.handX - 30,
			    viewHeight - rightHand.height * 0.5 + this.handY + 45,
			    rightHand.width * 0.5,
				rightHand.height * 0.5
            );
        },

        nextLevel: function () {
            this.game.setState(new core.GameAnimationState(core.GameAnimationState.CLIP_2));
        },
    });

    //game level2 state
    core.GameLevel2State = function () {
        core.GameLevelState.call(this);
    }

    Alistuff.ext(core.GameLevel2State, core.GameLevelState, {

        start: function (game) {
            this.game = game;
            this.level = new lv.OutsideLevel(this);
            this.player = new et.Player(this.level.spawnX, this.level.spawnY, this.level);
            this.player.height = this.level.gridSize / 2;
            this.player.speed = 2;
            this.level.player = this.player;

            this.rayCaster = new renderer.RayCaster();
            this.rayCaster.init(0, 0, 480, 320, game, this.level, new renderer.TextureRenderer());

            var self = this;
            this.fadeIn(5);

            game.addKeyListener('w', function () { self.player.turnUp(); });
            game.addKeyListener('s', function () { self.player.turnDown(); });
            game.addKeyListener('a', function () { self.player.turnLeft(); });
            game.addKeyListener('d', function () { self.player.turnRight(); });
            game.addKeyListener('q', function () { self.player.rotateLeft(); });
            game.addKeyListener('e', function () { self.player.rotateRight(); });
            game.addMouseListener('mousedown', function () { });

            if (game.supportPointerLock()) {
                var yy = 0;
                game.requestPointerLock(function (e) {
                    var client = game.windowToCanvas(e.x, e.y);
                    yy += e.movementY;
                    if (yy < -50) yy = -50;
                    if (yy > game.getHeight() + 50) yy = game.getHeight() + 50;

                    self.player.lookAround(client.x, yy, game.getWidth(), game.getHeight());
                });
            }
            else {
                game.addMouseListener('mousemove', function (e) {
                    var client = game.windowToCanvas(e.clientX, e.clientY);
                    self.player.lookAround(client.x, client.y, game.getWidth(), game.getHeight());
                });
            }
        },

        end: function (game) {
            game.removeKeyListener('w');
            game.removeKeyListener('s');
            game.removeKeyListener('a');
            game.removeKeyListener('d');
            game.removeKeyListener('q');
            game.removeKeyListener('e');
            game.removeMouseListener('mousedown');
            game.removeMouseListener('mousemove');
            game.freePointerLock();
        },

        update: function (deltaTime) {
            this.player.update(deltaTime);
            this.level.update(deltaTime);
            this.rayCaster.update(deltaTime);
            this.stage.update(deltaTime);
        },

        render: function (context) {
            this.rayCaster.render(context);
            this.stage.render(context);
        },

        transitionRender: function (context) {
            context.save();
            context.fillStyle = '#000';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            context.restore();
        },

        nextLevel: function () {
            var self = this;
            this.fadeOut(5, 0xffffff, function () {
                self.game.setState(new core.GameAnimationState(core.GameAnimationState.CLIP_3));
            })
        },
    });

    //game end state
    core.GameEndState = function () {
        core.State.call(this);
        this.stage = undefined;
        this.game = undefined;
        
        this.words = [
            { title: 'Programming', items: ['Ali               alistuff@163.com'] },
            {
                title: 'Thank Technology',
                items: [
                    'HTML5',
                    'RayCasting        http://www.permadi.com/tutorial/raycast/index.html',
                ]
            },
            { title: 'Thank Graphics', items: ['http://www.opengameart.org'] },
            {
                title: 'Thank Audio',
                items: [
                    'Doll Dancing      https://www.youtube.com/audiolibrary/music',
                    'Dark Long Hits    http://marcelofernandez.tk/ Marcelo -Fernandez',
                    'Dungeon Ambient   http://www.opengameart.org',
                    'Evil Chanting     http://opengameart.org/users/teckpow -teckpow',
                    'Horror Ambient    http://opengameart.org/content/horror-ambient -Vinrax',
                    'Zombie Pain       http://opengameart.org/content/zombie-pain -Vinrax',
                    'So You Code       https://www.youtube.com/watch?v=hJbW2v_4CpY',
                    'Think Different   John Debney'
                ]
            },
            { title: 'Thank Github', items: [''] },
        ];
    }

    Alistuff.ext(core.GameEndState, core.State, {
        start: function (game) {
            this.game = game;
            this.stage = new animation.Stage();
            var height = game.getHeight()+100;
            var t = 0;
            var speed = 20;
            for (var i = 0; i < this.words.length; i++) {
                var title = this.words[i].title;
                var x = 10;
                var y = height;
                var titleActor = new animation.TextActor(title, this.makeTextRenderer('20px 微软雅黑'), x, y, 255, 255, 255, 0);
                titleActor.addAnimation(t, t + speed, new animation.TranslateAnimation(0, -height));
                titleActor.addAnimation(t+4, t + 6, new animation.AlphaAnimation(1));
                titleActor.addAnimation(t + speed - 2, t + speed, new animation.AlphaAnimation(-1));
                
                for (var j = 0; j < this.words[i].items.length; j++) {
                    t += 1.3;
                    var item = this.words[i].items[j];
                    var itemActor = new animation.TextActor(item, this.makeTextRenderer('12.5px 微软雅黑'), x + 10, height, 255, 255, 255, 0);
                    itemActor.addAnimation(t, t + speed, new animation.TranslateAnimation(0, -height));
                    itemActor.addAnimation(t + 4, t + 6, new animation.AlphaAnimation(1));
                    itemActor.addAnimation(t + speed - 2, t + speed, new animation.AlphaAnimation(-1))
                    this.stage.addActor(itemActor);
                }

                t += 2.8;
                this.stage.addActor(titleActor);
            }

            this.game.playSound('So You Code');
        },

        end: function (game) { },

        update: function (deltaTime) {
            this.stage.update(deltaTime);
        },

        render: function (context) {
            context.save();
            context.fillStyle = '#000';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            context.restore();
            this.stage.render(context);
            if (this.stage.getActorCount() === 0) {
                var col = Math.floor(Math.random() * 255);
                context.fillStyle = 'rgb(' + col + ',' + col + ',' + col + ')';
                context.font = '40px 微软雅黑';
                context.fillText('So you code', 100, 150 + Math.sin(col)*5);
            }
        },

        transitionRender: function (context) {
            context.save();
            context.fillStyle = '#000';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            context.restore();
        },

        makeTextRenderer: function (font) {
            return function (context, actor) {
                context.save();
                context.font = font;
                context.fillStyle = actor.getRGBA();
                context.fillText(actor.text, actor.x, actor.y);
                context.restore()
            };
        },
    });

})(Alistuff.fps,Alistuff.animation,Alistuff.fps.level,Alistuff.fps.entities,Alistuff.fps.renderer);