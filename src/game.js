/*
 *The MIT License (MIT)
 *
 *Copyright (c) 2015 alistuff
 *
 *Permission is hereby granted, free of charge, to any person obtaining a copy
 *of this software and associated documentation files (the "Software"), to deal
 *in the Software without restriction, including without limitation the rights
 *to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *copies of the Software, and to permit persons to whom the Software is
 *furnished to do so, subject to the following conditions:
 *
 *The above copyright notice and this permission notice shall be included in all
 *copies or substantial portions of the Software.
 *
 *THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *SOFTWARE.
 */
//core
(function (core, gfx) {
    /*
     *Game
    */
    core.Game = function (canvasid) {
        var canvas = document.getElementById(canvasid);
        this.context = canvas.getContext('2d');
        var offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        this.offscreenContext = offscreenCanvas.getContext('2d');

        this.startTime = 0;
        this.lastTime = 0;
        this.gameTime = 0;
        this.fpsTime = 0;
        this.fps = 0;

        this.imagesQueue = [];
        this.images = {};
        this.succeedCounter = 0;
        this.failedCounter = 0;
        this.textures = {};

        this.audio = new Audio();
        this.soundChannels = [];
        this.soundQueue = [];
        this.MAX_SOUND_CHANNELS = 10;
        for (var i = 0; i < this.MAX_SOUND_CHANNELS; i++) {
            this.soundChannels.push(new Audio());
        }

        self = this;
        this.keyboardListeners = [];
        window.onkeydown = function (e) { self.keyPressed(e); };
        //window.onkeypress = function (e) { self.keyPressed(e); };

        this.stateManager = undefined;

        return this;
    }

    core.Game.prototype = {

        getWidth:function(){
            return this.context.canvas.width;
        },

        getHeight:function(){
            return this.context.canvas.height;
        },

        getCurrentTime: function () {
            return +new Date();
        },

        getFps: function () {
            return this.fps.toFixed(2);
        },

        getGameTime: function () {
            return (this.gameTime / 1000).toFixed(2);
        },

        windowToCanvas: function (x, y) {
            var bounding = this.context.canvas.getBoundingClientRect();

            return {
                x: x - bounding.left * (this.context.canvas.width / bounding.width),
                y: y - bounding.top * (this.context.canvas.height / bounding.height)
            };
        },

        start: function () {
            this.stateManager = new core.StateManager(this);
            this.startTime = this.getCurrentTime();
            this.init(this.offscreenContext);
            var self = this;
            window.requestNextAnimationFrame(function (time) {
                self.animate.call(self, time);
            });
        },

        animate: function (time) {
            var self = this;
            var delta = time - this.lastTime;

            if (this.lastTime == 0) {
                this.fps = 60;
                delta = 1000/60;
            }
            else {
                if (this.gameTime - this.fpsTime > 1000) {
                    this.fps = 1000 / (delta);
                    this.fpsTime = this.gameTime;
                }
            }

            this.gameTime = this.getCurrentTime() - this.startTime;
            this.lastTime = time;

            this.update(delta/1000);
            this.clearCanvas();
            this.render(this.offscreenContext);
            this.flip();
            
            window.requestNextAnimationFrame(function (time) {
                self.animate.call(self, time);
            });
        },

        init: function (context) { },

        update: function (time) { },

        render: function (context) { },

        clearCanvas: function () {
            this.offscreenContext.clearRect(0, 0,
                this.offscreenContext.canvas.width, this.offscreenContext.canvas.height);
            this.context.clearRect(0, 0,
                this.context.canvas.width, this.context.canvas.height);
        },

        flip: function () {
            this.context.drawImage(this.offscreenContext.canvas, 0, 0, this.context.canvas.width, this.context.canvas.height);
        },

        queueImage: function (alias, imageUrl) {
            this.imagesQueue.push({ alias: alias, url: imageUrl });
        },

        loadImages: function (loadCompletedCallback, load, error) {

            var length = this.imagesQueue.length;
            if (length === 0) {
                loadCompletedCallback();
            }

            var self = this;
            for (var i = 0; i < length; i++) {
                var image = new Image();
                var queueItem = this.imagesQueue[i];

                image.addEventListener('load', function (i) {
                    self.succeedCounter++;
                    load && load((self.succeedCounter + self.failedCounter) / length * 100);
                    if (self.loadCompleted()) {
                        loadCompletedCallback(self.succeedCounter == length ? true : false);
                    }
                });

                image.addEventListener('error', function () {
                    self.failedCounter++;
                    error && error(this.src + ' load failure!');
                    if (self.loadCompleted()) {
                        loadCompletedCallback(false);
                    }
                });

                image.src = queueItem.url;
                this.images[queueItem.alias] = image;
            }
        },

        loadCompleted: function () {
            return (this.succeedCounter + this.failedCounter) == this.imagesQueue.length;
        },

        getImage: function (alias) {
            return this.images[alias];
        },

        getTexture: function (alias) {
            if (this.textures[alias] == undefined)
                this.textures[alias] = gfx.Texture.fromImage(this.getImage(alias));
            return this.textures[alias];
        },

        canPlayOgg:function(){
            return this.audio.canPlayType('audio/ogg; codecs="vorbis"') != '';
        },

        canPlayMp4:function(){
            return this.audio.canPlayType('audio/mp4') != '';
        },

        getSoundChannel:function(){
            var audio;

            for (var i = 0; i < this.MAX_SOUND_CHANNELS; i++) {
                audio = this.soundChannels[i];
                if (audio.played && audio.played.length > 0) {
                    if (audio.ended) {
                        return i + 1;
                    }
                }
                else {
                    if (!this.soundLoading(i) && !audio.ended) {
                        return i + 1;
                    }
                }
            }
            return undefined;
        },

        soundLoading:function(channel){
            for (var i = 0; i < this.soundQueue.length; i++) {
                if (this.soundQueue[i] === channel) {
                    return true;
                }
            }
            return false;
        },

        playSound:function(url,loop){
            var channel = this.getSoundChannel();
            var element = document.getElementById(url);

            if (channel) {
    
                var index = channel - 1;
                var audio = this.soundChannels[index];

                self = this;
                this.soundQueue.push(index);

                function loadCompleted(channelIndex) {
                    if (this.soundLoading(channelIndex)) {
                        this.soundQueue.splice(channelIndex, 1);
                    }
                };

                audio.addEventListener('canPlay', function () { loadCompleted.call(self, index); });
                audio.addEventListener('error', function () { loadCompleted.call(self, index); });
                audio.addEventListener('abort', function () { loadCompleted.call(self, index); });
     
                if (element) {
                    audio.src = element.src === '' ? element.currentSrc : element.src;
                }
                else {
                    audio.src = url;
                }
                audio.load();
                audio.play();
                audio.loop = loop;

                return channel;
            }
            return undefined;
        },

        pauseSound: function (id) {
            if (id && id <= this.MAX_SOUND_CHANNELS) {
                var audio = this.soundChannels[id-1];
                audio.pause();
                return id;
            }
            return undefined;
        },

        resumeSound:function(id){
            if (id && id <= this.MAX_SOUND_CHANNELS) {
                var audio = this.soundChannels[id - 1];
                audio.play();
                return id;
            }
            return undefined;
        },

        stopSound: function (id) {
            if (id && id <= this.MAX_SOUND_CHANNELS) {
                var audio = this.soundChannels[id - 1];
                audio.src = '';
            }
            return undefined;
        },

        addMouseListener: function (type, listener) {
            this.context.canvas.addEventListener(type, listener, false);
        },

        removeMouseListener: function (type, listener) {
            this.context.canvas.removeEventListener(type, listener, false);
        },

        addKeyListener: function (key, listener) {
            this.keyboardListeners.push({ key: key, listener: listener });
        },

        removeKeyListener: function (key, listener) {
            for (var i = 0; i < this.keyboardListeners.length; i++) {
                var pair = this.keyboardListeners[i];
                if (pair.key === key) {
                    if (listener) {
                        if (pair.listener === listener) {
                            this.keyboardListeners.splice(i--, 1);
                        }
                    } else {
                        this.keyboardListeners.splice(i--, 1);
                    }
                }
            }
        },

        keyPressed: function (e) {
            var key = undefined;
            var listener = undefined;

            switch (e.keyCode) {
                case 87: key = 'w'; break;
                case 65: key = 'a'; break;
                case 83: key = 's'; break;
                case 68: key = 'd'; break;
                case 81: key = 'q'; break;
                case 69: key = 'e'; break;
                case 90: key = 'z'; break;
                case 88: key = 'x'; break;
                case 74: key = 'j'; break;
                case 75: key = 'k'; break;
                case 82: key = 'r'; break;
                case 37: key = 'left'; break;
                case 39: key = 'right'; break;
                case 38: key = 'up'; break;
                case 40: key = 'down'; break;
                case 32: key = 'space'; break;
                case 13: key = 'enter'; break;
            }

            for (var i = 0; i < this.keyboardListeners.length; i++) {
                var pair = this.keyboardListeners[i];
                if (pair.key === key && pair.listener) {
                    pair.listener();
                    window.returnValue = false;
                  //  break;
                }
            }
        },

        supportPointerLock: function () {
            var canvas = this.context.canvas;
            var requestPointerLock = canvas.requestPointerLock ||
                canvas.mozRequestPointerLock ||
                canvas.webkitRequestPointerLock;
            return requestPointerLock;
        },

        requestPointerLock:function(pointerLockCallback){
            var canvas =this.context.canvas;

            var requestPointerLock = this.supportPointerLock();
            if (!requestPointerLock) {
              //  console.log('not support pointerLock');
                return undefined;
            }

            canvas.requestPointerLock = requestPointerLock;

            document.exitPointerLock = document.exitPointerLock ||
                document.mozExitPointerLock ||
                document.webkitExitPointerLock;

            canvas.onclick = function () {
                canvas.requestPointerLock();
              //  console.log('canvas requstPointerLock');
            };

            function makeLockCallback() {
                var x = 0;
                var y = 0;

                return function (e) {
                    var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
                    var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
                    x += movementX;
                    y += movementY;
                    pointerLockCallback && pointerLockCallback({
                        x: x,
                        y: y,
                        movementX: movementX,
                        movementY: movementY
                    });
                };
            };

            var mousemoveCallback = makeLockCallback();

            function lockChangeCallback() {
                if (document.pointerLockElement === canvas ||
                   document.mozPointerLockElement === canvas ||
                   document.webkitPointerLockElement === canvas) {
                 //   console.log('pointer locked');
                    document.addEventListener('mousemove', mousemoveCallback, false);
                } else {
               //     console.log('pointer unlocked');
                    document.removeEventListener('mousemove', mousemoveCallback, false);
                    document.exitPointerLock();
                }
            };

            document.addEventListener('pointerlockchange', lockChangeCallback, false);
            document.addEventListener('mozpointerlockchange', lockChangeCallback, false);
            document.addEventListener('webkitpointerlockchange', lockChangeCallback, false);
        },

        freePointerLock: function () {
            if (this.supportPointerLock()) {
                document.exitPointerLock();
            }
        },

        setState: function (state) {
            this.stateManager.setState(state);
        },
    };

    /*
     *Game StateManager
    */
    core.StateManager = function (game) {
        this.currentState = undefined;
        this.game = game;
        this.updated = false;
    }

    core.StateManager.prototype = {

        setState: function (state) {          
            this.currentState && this.currentState.end(this.game);
            this.currentState = state;
            this.currentState.start(this.game);
            this.updated = false;
        },

        update: function (deltaTime) {
            this.updated = true;
            this.currentState && this.currentState.update(deltaTime);
        },

        render: function (context) {
            if (this.updated) {
                this.currentState && this.currentState.render(context);
            } else {
                this.currentState && this.currentState.transitionRender(context);
            }
        }

    };

    /*
     *Game State
    */
    core.State = function () { }

    core.State.prototype = {

        start: function (game) { },

        end: function (game) { },

        update: function (deltaTime) { },

        render: function (context) { },

        transitionRender: function (context) {

        },
    };

})(Alistuff.fps, Alistuff.fps.graphics);