(function() {
    window.Helpers = {
        getObjValues: function(obj) {
            var key, items = obj || {};
            var arr = [];
            for (key in items) {
                if (items.hasOwnProperty(key)) {
                    arr.push(items[key]);
                }
            }

            return arr;
        },
        getObjKeys: function(obj) {
            var key, items = obj || {};
            var arr = [];
            for (key in items) {
                if (items.hasOwnProperty(key)) {
                    arr.push(key);
                }
            }

            return arr;
        },
        within: function(value, min, max) {
            return value != null && value >= min && value < max;
        },
        withinGrid: function(pos, rows, columns) {
            return pos && Helpers.within(pos.x, 0, columns) && Helpers.within(pos.y, 0, rows);
        }
    };
})();