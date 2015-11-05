(function() {
	var blockHeight = 83;

	var Block = function(ctx, type, x, y) {
		this.context = ctx;
		this.type = type;
		this.sprite = Block.types[this.type];
		this.x = x;
		this.y = y;
	};

	Block.types = {
		'grass': 'images/grass-block.png',
		'stone': 'images/stone-block.png',
		'water': 'images/water-block.png'
	};

	Block.getSprites = function() {
		return Helpers.getObjValues(Block.types);
	};

	Block.prototype.render = function() {
		var img = Resources.get(this.sprite);
		this.context.drawImage(img, this.x * img.width, this.y * blockHeight);
	};

	var Player = function(ctx, character, x, y) {
		this.context = ctx;
		this.character = character;
		this.sprite = Player.characters[this.character];
		this.x = x;
		this.y = y;
	};

	Player.getSprites = function() {
		return Helpers.getObjValues(Player.characters);
	};

	Player.characters = {
		'boy': 'images/char-boy.png',
		'cat-girl': 'images/char-cat-girl.png',
		'pink-girl': 'images/char-pink-girl.png'
	};
	Player.validMoves = {
		left: [-1, 0],
		right: [1, 0],
		up: [0, -1],
		down: [0, 1]
	};

	Player.prototype.render = function() {
		var img = Resources.get(this.sprite);
		this.context.drawImage(img, this.x * img.width, this.y * blockHeight - 10);
	};

	Player.prototype.move = function(move, rows, columns) {
		var movement = Player.validMoves[move];

		if (!movement || movement.length != 2) {
			return;
		}

		var newX = this.x + movement[0];
		var newY = this.y + movement[1];

		if (Helpers.withinGrid({ x: newX, y: newY }, rows, columns)) {
			this.x = newX;
			this.y = newY;
		}
	};

	window.Player = Player;
	window.Block = Block;
})();