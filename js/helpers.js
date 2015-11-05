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
		}
	};
})();