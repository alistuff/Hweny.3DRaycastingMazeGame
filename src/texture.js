//
(function (ns) {

    ns.Texture = function () {
        this.buffer = undefined;
        this.width = 0;
        this.height = 0;
        this.deviceWidth = 0;
        this.deviceHeight = 0;
        this.factor = undefined;
        this.complete = false;
    };

    ns.Texture.fromImage = function (image) {
        if (image == undefined)
            throw 'image undefined';

        var newTexture = new ns.Texture();

        var width, height;
        if (image.naturalWidth) {
            width = image.naturalWidth;
            height = image.naturalHeight;
        } else {
            width = image.width;
            height = image.height;
        }

        newTexture.width = width;
        newTexture.height = height;
        newTexture.complete = image.complete;

        var ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = width;
        ctx.canvas.height = height;
        ctx.drawImage(image, 0, 0);

        var imageData = ctx.getImageData(0, 0, width, height);
        var data = imageData.data;
        var length = data.length;

        newTexture.buffer = [];
        for (var i = 0; i < length; i += 4) {
            newTexture.buffer[i] = data[i];
            newTexture.buffer[i + 1] = data[i + 1];
            newTexture.buffer[i + 2] = data[i + 2];
            newTexture.buffer[i + 3] = data[i + 3];
        }

        newTexture.deviceWidth = imageData.width;
        newTexture.deviceHeight = imageData.height;

        newTexture.factor = {
            x: newTexture.deviceWidth / newTexture.width,
            y: newTexture.deviceHeight / newTexture.height
        };

        return newTexture;
    };

    ns.Texture.fromColor = function (width, height, color) {

        if (width <= 0 || height <= 0)
            throw 'error size';

        var rgba = color || { r: 0, g: 0, b: 0, a: 0 };

        var r = Math.max(0, Math.min(rgba.r, 255)),
            g = Math.max(0, Math.min(rgba.g, 255)),
            b = Math.max(0, Math.min(rgba.b, 255)),
            a = Math.max(0, Math.min(rgba.a, 1)) * 255;

        var newTexture = new ns.Texture();
        newTexture.width = width;
        newTexture.height = height;
        newTexture.complete = true;

        var ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = width;
        ctx.canvas.height = height;

        var imageData = ctx.getImageData(0, 0, width, height),
            data = imageData.data,
            length = data.length;

        newTexture.buffer = [];
        for (var i = 0; i < length; i += 4) {
            newTexture.buffer[i] = r;
            newTexture.buffer[i + 1] = g;
            newTexture.buffer[i + 2] = b;
            newTexture.buffer[i + 3] = a;
        }

        newTexture.deviceWidth = imageData.width;
        newTexture.deviceHeight = imageData.height;

        newTexture.factor = {
            x: newTexture.deviceWidth / newTexture.width,
            y: newTexture.deviceHeight / newTexture.height
        };

        return newTexture;
    };

    ns.Texture.prototype = {

        getRGBHex:function(x,y){
            var pixel = this.getPixel(x, y);
            return (pixel.r << 16) | (pixel.g << 8) | (pixel.b);
        },

        getPixel: function (x, y) {
            x = Math.floor(x);
            y = Math.floor(y);
            if (x < 0 || x >= this.width || y < 0 || y >= this.height)
                throw 'argument out of range';

            var dx = x * this.factor.x;
            var dy = y * this.factor.y;

            var index = Math.floor(dy * this.deviceWidth + dx) * 4;
            return {
                r: this.buffer[index],
                g: this.buffer[index + 1],
                b: this.buffer[index + 2],
                a: this.buffer[index + 3]
            };
        },

        setPixel: function (x, y, color) {
            if (x < 0 || x >= this.width || y < 0 || y > this.height)
                throw 'argument out of range';

            var rgba = color || { r: 0, g: 0, b: 0, a: 0 };

            var r = Math.max(0, Math.min(rgba.r, 255)),
                g = Math.max(0, Math.min(rgba.g, 255)),
                b = Math.max(0, Math.min(rgba.b, 255)),
                a = Math.max(0, Math.min(rgba.a, 1)) * 255;

            var dx = x * this.factor.x;
            var dy = y * this.factor.y;

            var index = Math.floor((dy * this.deviceWidth + dx)) * 4;

            this.buffer[index] = r;
            this.buffer[index + 1] = g;
            this.buffer[index + 2] = b;
            this.buffer[index + 3] = a;
        },

        setAlpha: function (alpha) {
            if (this.buffer == undefined)
                throw 'undefined';

            alpha = alpha || 1;
            alpha = Math.max(0, Math.min(alpha, 1)) * 255;

            var length = this.buffer.length;
            for (var i = 0; i < length; i += 4) {
                this.buffer[i + 3] = alpha;
            }

            return this;
        },

        setGrayScale: function () {
            if (this.buffer == undefined)
                throw 'undefined';

            var gray = undefined;
            var length = this.buffer.length;
            for (var i = 0; i < length; i += 4) {
                gray = (this.buffer[i] + this.buffer[i + 1] + this.buffer[i + 2]) / 3;
                this.buffer[i] = gray;
                this.buffer[i + 1] = gray;
                this.buffer[i + 2] = gray;
            }

            return this;
        },

        setThresholding: function () {
            if (this.buffer == undefined)
                throw 'undefined';

            var graytest = 255 / 3;
            var gray = undefined;
            var length = this.buffer.length;
            for (var i = 0; i < length; i += 4) {
                gray = (this.buffer[i] + this.buffer[i + 1] + this.buffer[i + 2]) / 3;
                if (gray >= graytest) {
                    this.buffer[i] = 255;
                    this.buffer[i + 1] = 255;
                    this.buffer[i + 2] = 255;
                }
                else {
                    this.buffer[i] = 0;
                    this.buffer[i + 1] = 0;
                    this.buffer[i + 2] = 0;
                }
            }

            return this;
        },

        setNegative: function () {
            if (this.buffer == undefined)
                throw 'undefined';

            var length = this.buffer.length;
            for (var i = 0; i < length; i += 4) {
                this.buffer[i] = 255 - this.buffer[i];
                this.buffer[i + 1] = 255 - this.buffer[i + 1];
                this.buffer[i + 2] = 255 - this.buffer[i + 2];
            }

            return this;
        },

        setEmboss: function () {
            if (this.buffer == undefined)
                throw 'undefined';

            var length = this.buffer.length;
            var stride = this.deviceWidth * 4;

            for (var i = 0; i < length; i++) {
                if (i <= (length - stride)) {
                    if ((i + 1) % 4 !== 0) {
                        if ((i + 4) % stride == 0) {
                            this.buffer[i] = this.buffer[i - 4];
                            this.buffer[i + 1] = this.buffer[i - 3];
                            this.buffer[i + 2] = this.buffer[i - 2];
                            this.buffer[i + 3] = this.buffer[i - 1];
                            i += 4;
                        } else {
                            this.buffer[i] = 255 / 2 + 2 * this.buffer[i] - this.buffer[i + 4] - this.buffer[i + stride];
                        }
                    }
                } else {
                    if ((i + 1) % 4 !== 0) {
                        this.buffer[i] = this.buffer[i - stride];
                    }
                }
            }

            return this;
        },

        clone: function () {
            var newTexture = new Texture();
            newTexture.buffer = [];
            newTexture.width = this.width;
            newTexture.height = this.height;
            newTexture.deviceWidth = this.deviceWidth;
            newTexture.deviceHeight = this.deviceHeight;
            newTexture.factor = this.factor;
            newTexture.complete = this.complete;

            var length = this.buffer.length;
            for (var i = 0; i < length; i += 4) {
                newTexture.buffer[i] = this.buffer[i];
                newTexture.buffer[i + 1] = this.buffer[i + 1];
                newTexture.buffer[i + 2] = this.buffer[i + 2];
                newTexture.buffer[i + 3] = this.buffer[i + 3];
            }

            return newTexture;
        },

        render: function (context, x, y) {
            if (this.complete) {

                x = x || 0;
                y = y || 0;

                var clipRect = {};
                clipRect.x = Math.max(0, Math.min(x, context.canvas.width - 1));
                clipRect.y = Math.max(0, Math.min(y, context.canvas.height - 1));
                clipRect.right = Math.max(0, Math.min(x + this.width - 1, context.canvas.width - 1));
                clipRect.bottom = Math.max(0, Math.min(y + this.height - 1, context.canvas.height - 1));
                clipRect.width = Math.floor(clipRect.right - clipRect.x + 1);
                clipRect.height = Math.floor(clipRect.bottom - clipRect.y + 1);

                if (clipRect.width <= 0 || clipRect.height <= 0)
                    return;

                var imagedata = context.getImageData(clipRect.x, clipRect.y, clipRect.width, clipRect.height),
                    data = imagedata.data;

                var deviceWidthOverCssWidth = imagedata.width / clipRect.width;
                var scaleStride = (imagedata.height / clipRect.height) * imagedata.width;

                var offsetX = clipRect.x - x;
                var offsetY = clipRect.y - y;
                var rgba = undefined;
                var index = 0;

                for (var j = offsetY; j < clipRect.height; j++) {
                    for (var i = offsetX; i < clipRect.width; i++) {
                        rgba = this.getPixel(i, j);

                        index = Math.floor(((j - offsetY) * scaleStride + (i - offsetX) * deviceWidthOverCssWidth) * 4);

                        if (rgba.a == 255) {
                            data[index] = rgba.r;
                            data[index + 1] = rgba.g;
                            data[index + 2] = rgba.b;
                            data[index + 3] = rgba.a;
                        }
                        else {
                            var sa = rgba.a / 255;
                            var da = data[index + 3] / 255;
                            var alpha = sa + da * (1 - sa);

                            data[index] = (rgba.r * sa + (1 - sa) * data[index] * da) / alpha;
                            data[index + 1] = (rgba.g * sa + (1 - sa) * data[index + 1] * da) / alpha;
                            data[index + 2] = (rgba.b * sa + (1 - sa) * data[index + 2] * da) / alpha;
                            data[index + 3] = alpha * 255;
                        }
                    }
                }

                context.putImageData(imagedata, clipRect.x, clipRect.y);
            }
        },
    };

})(Alistuff.fps.graphics);