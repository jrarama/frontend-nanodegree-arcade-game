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
     * Create a block by specifying a type and its position
     * @constructor
     */
    var Block = function(type, x, y) {
        this.type = type;
        this.sprite = Block.types[this.type];
        this.x = x;
        this.y = y;
    };

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
     * Render the block using the context
     * @param {{object}} ctx
     *         The canvas context
     */
    Block.prototype.render = function(ctx) {
        var img = Resources.get(this.sprite);
        ctx.drawImage(img, this.x * img.width, this.y * blockHeight);
    };

    /**
     * Create a Player by specifying the character and its position
     * @constructor
     */
    var Player = function(character, x, y) {
        this.character = character;
        this.sprite = Player.characters[this.character];
        this.x = x;
        this.y = y;
    };

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
     * Render the player using the context
     * @param {{object}} ctx
     *         The canvas context
     */
    Player.prototype.render = function(ctx) {
        var img = Resources.get(this.sprite);
        ctx.drawImage(img, this.x * img.width, this.y * blockHeight - 10);
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
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.sprite = Enemy.sprite;
    };

    /** The image of the enemy */
    Enemy.sprite = "images/enemy-bug.png";

    /**
     * Render the enemy using the context
     * @param {{object}} ctx
     *         The canvas context
     */
    Enemy.prototype.render = function(ctx) {
        var img = Resources.get(this.sprite);
        ctx.drawImage(img, this.x * img.width, this.y * blockHeight - 20);
    };

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