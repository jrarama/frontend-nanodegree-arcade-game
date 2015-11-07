/**
 * Entities.js
 * All game entities are defined here. This file should be loaded before engine.js
 * where it will be used. As much as possible, there should be no reference to the Engine
 * class here because engine.js is not defined here at the moment. All parameters needed
 * by all entities must be passed either by its constructor or as an argument to its
 * functions.
 */
(function() {

    var blockHeight = 83;

    /**
     * Create an Entity by specifying its sprite and its position
     * @constructor
     * @param {{string}} sprite
     *		The path of entity's image
     * @param {{number}} x
     *		The entity's X position
     * @param {{number}} y
     *		The entity's Y position
     * @param {{number}} offsetX
     *		The entity's horizontal offset position
     * @param {{number}} offsetY
     *		The entity's vertical offset position
     */
	var Entity = function(sprite, x, y, offsetX, offsetY) {
		this.x = x;
		this.y = y;
		this.offsetX = offsetX || 0;
		this.offsetY = offsetY || 0;
		this.sprite = sprite;
		if (this.sprite) {
			this.img = Resources.get(this.sprite);
		}
	};

	Entity.prototype = {
		/**
		 * Get the cached image from Resources
		 */
		getImage: function() {
			this.img = Resources.get(this.sprite);
			return this.img;
		},
		/**
	     * Render the block using the context
	     * @param {{object}} ctx
	     *      The canvas context
	     */
		render: function(ctx) {
	        var img = this.getImage();
	        ctx.drawImage(img, this.x * img.width + this.offsetX, this.y * blockHeight + this.offsetY);
	    }
	};

    /**
     * Create a block by specifying a type and its position
     * @constructor
     */
    var Block = function(type, x, y) {
    	this.type = type;
    	// Use the constructor of its parent class Entity
    	Entity.call(this, Block.types[this.type], x, y);
    };

    /** Inherit properties and functions from Entity class */
    Block.inheritsFrom(Entity);

    /** The block types with their image paths as its value */
    Block.types = {
        'grass': 'images/grass-block.png',
        'stone': 'images/stone-block.png',
        'water': 'images/water-block.png'
    };

    /** Get all the images used for Block */
    Block.getSprites = function() {
        return Helpers.getObjValues(Block.types);
    };

    /**
     * Create a Player by specifying the character and its position
     * @constructor
     */
    var Player = function(character, x, y) {
    	this.character = character;
    	// Use the constructor of its parent class Entity
        Entity.call(this, Player.characters[character], x, y, 0, -10);
    };

    /** Inherit properties and functions from Entity class */
	Player.inheritsFrom(Entity);

    /** Get all the images used for Player */
    Player.getSprites = function() {
        return Helpers.getObjValues(Player.characters);
    };

    /** The player characters with their image paths as its value */
    Player.characters = {
        'boy': 'images/char-boy.png',
        'cat-girl': 'images/char-cat-girl.png',
        'pink-girl': 'images/char-pink-girl.png'
    };

    /** The list of valid moves with x and y changes it will make */
    Player.validMoves = {
        left: [-1, 0],
        right: [1, 0],
        up: [0, -1],
        down: [0, 1]
    };

	/**
     * Move the player in the grid
     * @param {{string}} move
     *         A valid move defined in Player.validMoves
     * @param {{int}} rows
     *        The number of rows in the grid
     * @param {{int}} columns
     *        The number of columns in the grid
     */
	Player.prototype.move = function(move, rows, columns) {
        var movement = Player.validMoves[move];

        /* Check if move is valid and has x and y values */
        if (!movement || movement.length != 2) {
            return;
        }

        var newX = this.x + movement[0];
        var newY = this.y + movement[1];

        /* Check if the new positions are within the grid before setting it */
        if (Helpers.withinGrid({ x: newX, y: newY }, rows, columns)) {
            this.x = newX;
            this.y = newY;
        }
    };

    /**
     * Create an Enemy by specifying its position and speed
     * @constructor
     */
    var Enemy = function(x, y, speed) {
    	// Use the constructor of its parent class Entity
    	Entity.call(this, Enemy.sprite, x, y, 0, -20);
        this.speed = speed;
    };

    /** Inherit properties and functions from Entity class */
    Enemy.inheritsFrom(Entity);

    /** The image of the enemy */
    Enemy.sprite = "images/enemy-bug.png";

	/**
     * Update the position of the enemy by passing the delta time
     * @param {{float}} dt
     *         The delta time or the number of time that passed from the last
     *    time that the canvas is redrawn.
     */
    Enemy.prototype.update = function(dt) {
        this.x += (this.speed * dt);
    };

    /**
     * Reset the position and speed of the enemy
     */
    Enemy.prototype.reset = function() {
        /* position the enemy to the leftmost side of screen minus 1 block */
        this.x = -1;

        /* randomize the y position */
        this.y = Math.floor(Math.random() * 3 + 1);

        /* Set the speed.
         * Minimum is 1 block per second and max is 3 blocks per second.
         */
        this.speed = 1 + Math.random() * 2;
    };

    /* Expose the entities to the outside world so that they can be used in other scripts */
    window.Player = Player;
    window.Block = Block;
    window.Enemy = Enemy;
})();