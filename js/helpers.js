/**
 * Helpers.js
 * All helper functions that needs to be available in all scripts
 * are maintained here.
 */
(function() {
    /** Make Helpers available globally by setting it a property of window. */
    window.Helpers = {
        /**
         * This function is used to loop through each object property
         * and return all the values as an array
         */
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
        /**
         * This function is used to loop through each object property
         * and return all the keys as an array
         */
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
        /** Used to check if a value is with a range  */
        within: function(value, min, max) {
            return value != null && value >= min && value <= max;
        },
        /** Used to check whether a position is inside the bounds of the game grid */
        withinGrid: function(pos, rows, columns) {
            return pos && Helpers.within(pos.x, 0, columns - 1) && Helpers.within(pos.y, 0, rows - 1);
        }
    };

    /** A utility function to inherit from another function */
    Function.prototype.inheritsFrom = function (parentClassOrObject) {
        if (parentClassOrObject.constructor == Function) {
            //Normal Inheritance
            this.prototype = Object.create(parentClassOrObject.prototype);
            this.prototype.constructor = this;
            this.prototype.parent = parentClassOrObject.prototype;
        } else {
            //Pure Virtual Inheritance
            this.prototype = parentClassOrObject;
            this.prototype.constructor = this;
            this.prototype.parent = parentClassOrObject.prototype;
        }
        return this;
    };
})();