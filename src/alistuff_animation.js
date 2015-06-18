/*
 *2D Animation
*/
Alistuff.animation = Alistuff.animation || {};
(function (ns) {
    //Actor
    ns.Actor = function (renderer, x, y, r, g, b, a, rotation, scalex, scaley) {
        this.x = x || 0;
        this.y = y || 0;
        this.scaleX = scalex || 0;
        this.scaleY = scaley || 0;
        this.r = r || 0;
        this.g = g || 0;
        this.b = b || 0;
        this.alpha = a === undefined ? 1 : a;
        this.rotation = rotation || 0;
        this.renderer = renderer;
        this.removed = false;
        this.visible = false;
        this.animations = [];
    }

    ns.Actor.prototype = {

        addAnimation: function (start, end, animation) {
            animation.start = start;
            animation.end = end;
            this.animations.push(animation);
            return this;
        },

        update: function (animationTime, deltaTime) {
            var complete = 0;
            this.visible = false;
            for (var i = 0, j = this.animations.length; i < j; i++) {
                var ani = this.animations[i];
                if (animationTime >= ani.start && animationTime <= ani.end) {
                    ani.animate(animationTime, deltaTime, this);
                    this.visible = true;
                }

                if (animationTime > ani.end) {
                    complete++;
                }
            }

            if (complete == this.animations.length) {
                this.removed = true;
            }
        },

        render: function (context) {
            if (!this.visible) return;
            this.renderer && this.renderer(context, this);
        },

        getRGBA: function () {
            return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.alpha + ')';
        },
    };

    //TextActor
    ns.TextActor = function (text, renderer, x, y, r, g, b, a, rotation, scalex, scaley) {
        ns.Actor.call(this, renderer, x, y, r, g, b, a, rotation, scalex, scaley);
        this.text = text;
        this.dynamicText = undefined;
    }

    Alistuff.ext(ns.TextActor, ns.Actor);

    //Stage
    ns.Stage = function () {
        this.accumulatedTime = 0;
        this.actors = [];
    }

    ns.Stage.prototype = {

        addActor: function (actor) {
            this.actors.push(actor);
            return this;
        },

        addAnimation: function (start, end, actor, animation) {
            for (var i = 0; i < this.actors.length; i++) {
                var act = this.actors[i];
                if (act === actor) {
                    act.addAnimation(start, end, animation);
                    return this;
                }
            }
            actor.addAnimation(start, end, animation);
            this.addActor(actor);
            return this;
        },

        skip: function (s) {
            this.accumulatedTime += s;
            return this;
        },

        getActorCount:function(){
            return this.actors.length;
        },

        getElapsedTime:function(){
            return this.accumulatedTime;
        },

        update: function (deltaTime) {
            this.accumulatedTime += deltaTime;
            for (var i = 0; i < this.actors.length; i++) {
                var actor = this.actors[i];
                actor.update(this.accumulatedTime, deltaTime);

                if (actor.removed) {
                    this.actors.splice(i--, 1);
                }
            }
        },

        render: function (context) {
            for (var i = 0, j = this.actors.length; i < j; i++) {
                var actor = this.actors[i];
                actor.render(context);
            }
        }
    };

    //Animation
    ns.Animation = function () {
        this.start = 0;
        this.end = 0;
    }

    ns.Animation.prototype = {
        animate: function (animationTime, deltaTime, actor) { },
        getDuration: function () {
            return this.end - this.start;
        }
    };

    //Animation -EmptyAnimation
    ns.EmptyAnimation = function () {
        ns.Animation.call(this);
    }

    Alistuff.ext(ns.EmptyAnimation, ns.Animation);

    ns.CallbackAnimation = function (callback, removed) {
        ns.Animation.call(this);
        this.callback = callback;
        this.removed = removed || true;
    }

    Alistuff.ext(ns.CallbackAnimation, ns.Animation, {
        animate: function (animationTime, deltaTime, actor) {
            if (this.callback) {
                this.callback(actor);
                actor.removed = this.removed;
            }
        },
    });

    //Animation -TranslateAnimation
    ns.TranslateAnimation = function (dx,dy) {
        ns.Animation.call(this);
        this.dx = dx || 0;
        this.dy = dy || 0;
    }

    Alistuff.ext(ns.TranslateAnimation, ns.Animation, {
        animate: function (animationTime, deltaTime, actor) {
            actor.x += this.dx / this.getDuration() * deltaTime;
            actor.y += this.dy / this.getDuration() * deltaTime;
        },
    });

    //Animation -ScaleAnimation
    ns.ScaleAnimation = function (sx, sy) {
        ns.Animation.call(this);
        this.sx = sx || 0;
        this.sy = sy || 0;
    }

    Alistuff.ext(ns.ScaleAnimation, ns.Animation, {
        animate: function (animationTime, deltaTime, actor) {
            actor.scaleX += this.sx / this.getDuration() * deltaTime;
            actor.scaleY += this.sy / this.getDuration() * deltaTime;
        },
    });

    //Animation -RotateAnimation
    ns.RotateAnimation = function (rotation) {
        ns.Animation.call(this);
        this.rotation = rotation || 0;
    }

    Alistuff.ext(ns.RotateAnimation, ns.Animation, {
        animate: function (animationTime, deltaTime, actor) {
            actor.rotation += this.rotation / this.getDuration() * deltaTime;
        },
    });

    //Animation -ShakeAnimation
    ns.ShakeAnimation = function (range) {
        ns.Animation.call(this);
        this.range = Math.max(0, range);
    }

    Alistuff.ext(ns.ShakeAnimation, ns.Animation, {
        animate: function (animationTime, deltaTime, actor) {

            actor.x += (this.range - Math.random() * this.range * 2) * deltaTime;
            actor.y += (this.range - Math.random() * this.range * 2) * deltaTime;
        },
    });

    //Animation -AlphaAnimation
    ns.AlphaAnimation = function (alpha) {
        ns.Animation.call(this);
        this.alpha = Math.max(-1, Math.min(1, alpha));
    }

    Alistuff.ext(ns.AlphaAnimation, ns.Animation, {
        animate: function (animationTime, deltaTime, actor) {
            actor.alpha += this.alpha / this.getDuration() * deltaTime;
            actor.alpha = Math.max(0, Math.min(1, actor.alpha));
        },
    });

    //Animation -TweenAnimation
    ns.TweenAnimation = function (r, g, b) {
        ns.Animation.call(this);
        this.r = Math.max(-255, Math.min(255, r));
        this.g = Math.max(-255, Math.min(255, g));
        this.b = Math.max(-255, Math.min(255, b));

        this.rr = 0;
        this.gg = 0;
        this.bb = 0;
    }

    Alistuff.ext(ns.TweenAnimation, ns.Animation, {
        animate: function (animationTime, deltaTime, actor) {

            this.rr += this.r / this.getDuration() * deltaTime
            this.gg += this.g / this.getDuration() * deltaTime
            this.bb += this.b / this.getDuration() * deltaTime

            if (Math.abs(this.rr) >= 1) {
                var val = this.rr > 0 ? 1 : -1;
                actor.r += val;
                this.rr -= val;
            }

            if (Math.abs(this.gg) >= 1) {
                var val = this.gg > 0 ? 1 : -1;
                actor.g += val;
                this.gg -= val;
            }

            if (Math.abs(this.bb) >= 1) {
                var val = this.bb > 0 ? 1 : -1;
                actor.b += val;
                this.bb -= val;
            }

            actor.r = Math.max(0, Math.min(255, actor.r));
            actor.g = Math.max(0, Math.min(255, actor.g));
            actor.b = Math.max(0, Math.min(255, actor.b));
        },
    });

    //Animation -TextAnimation
    ns.TEXT_ANIMATION_NORMAL = 0;
    ns.TEXT_ANIMATION_RIGHT_TO_LEFT = 1;
    ns.TEXT_ANIMATION_REVERSAL = 2;

    ns.TextAnimation = function (mode) {
        ns.Animation.call(this);
        this.mode = mode || ns.TEXT_ANIMATION_NORMAL;
    }

    Alistuff.ext(ns.TextAnimation, ns.Animation, {
        animate: function (animationTime, deltaTime, actor) {
            var text = actor.text;
            if (!(text && text.length)) return;

            var length = text.length;
            var index = Math.round(length / this.getDuration() * (animationTime - this.start));
            index = Math.min(index, length);
            switch (this.mode) {
                case ns.TEXT_ANIMATION_NORMAL:
                    actor.dynamicText = text.substring(0, index);
                    break;
                case ns.TEXT_ANIMATION_RIGHT_TO_LEFT:
                    actor.dynamicText = text.substring(length - index, length);
                    break;
                case ns.TEXT_ANIMATION_REVERSAL:
                    var oldText = actor.dynamicText = text.substring(length - index, length);
                    var result = '';
                    for (var i = oldText.length - 1; i >= 0; i--) {
                        result += oldText.charAt(i);
                    }
                    actor.dynamicText = result;
                    break;
            }
        },
    });
})(Alistuff.animation);