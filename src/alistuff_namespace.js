var Alistuff = Alistuff || {};
(function (ns) {

    ns.version = '1.0';

    ns.registerNamespace = function (namespace) {
        if (!namespace || !namespace.length)
            return undefined;

        var root = this;
        var parts = namespace.split('.');

        for (var i = 0, j = parts.length; i < j; i++) {
            var item = parts[i];
            if (!item || !item.length) return undefined;
            root[item] = root[item] || {};
            root = root[item];
        }
    };

    ns.createObject = function (prototype) {
        if (Object.create)
            return Object.create(prototype);

        function ctor() { };
        ctor.prototype = prototype;
        return new ctor();
    };

    ns.ext = function (child, parent, prototype) {
        child.prototype = this.createObject(parent.prototype);
        child.prototype.constructor = child;
        for (var p in prototype) {
            child.prototype[p] = prototype[p];
        }
    };

})(Alistuff);

