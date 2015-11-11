/**
 * Entities.js
 * All game entities are defined here. This file should be loaded before engine.js
 * where it will be used. As much as possible, there should be no reference to the Engine
 * class here because engine.js is not defined here at the moment. All parameters needed
 * by all entities that are not globally available must be passed either by its constructor
 * or as an argument to its functions.
 */
(function() {

    /** The default image height and width */
    var blockHeight = 83;
    var blockWidth = 101;

    /**
     * Create an Entity by specifying its sprite and its position
     * @constructor
     * @param {string} sprite
     *        The path of entity's image
     * @param {number} x
     *        The entity's X position
     * @param {number} y
     *        The entity's Y position
     * @param {number} offsetX
     *        The entity's horizontal offset position
     * @param {number} offsetY
     *        The entity's vertical offset position
     * @param {object} bounds
     *        The rectangle of the entity inside its image:
     *            x       - The entity's X position relative to the image
     *            y       - The entity's Y position relative to the image
     *            width   - The entity's width inside the image
     *            height  - The entity's height inside the image
     */
    var Entity = function(sprite, x, y, offsetX, offsetY, bounds) {
        this.x = x;
        this.y = y;

        /**
         * A flag that tells us weather we want to render the bounds when
         * Helpers.drawBounds variable is set to true
         */
        this.checkBounds = true;

        this.opacity = 1;
        this.scale = 1;
        this.offsetX = offsetX || 0;
        this.offsetY = offsetY || 0;
        this.translate = { x: 0, y: 0 };
        this.bounds = bounds;
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
         * Render the entity
         */
        render: function() {
            var img = this.getImage();
            var ctx = Resources.getContext();
            ctx.save();
            ctx.globalAlpha = this.opacity;
            if (this.translate !== 0 || this.translate !== 0) {
                ctx.translate(this.translate.x, this.translate.y);
            }
            var x = (this.x * blockWidth + this.offsetX);
            var y = (this.y * blockHeight + this.offsetY);

            ctx.drawImage(img, x, y, img.width * this.scale, img.height * this.scale);
            ctx.globalAlpha = 1.0;
            ctx.restore();
            if (Helpers.getDrawBounds() && this.checkBounds) {
                this.drawBounds(ctx);
            }

        },
        /**
         * Get the actual rectangle coordinate of the entity's bounds
         */
        getBounds: function() {
            var b = this.bounds || {};
            return {
                x:  this.x * blockWidth + (b.x || 0),
                y:  this.y * blockHeight + (b.y || 0),
                width: b.width || blockWidth,
                height: b.height || blockHeight
            };
        },
        /**
         * Draw the rectangle bounds of the entity
         */
        drawBounds: function(ctx) {
            var b = this.getBounds();
            if (!b) {
                return;
            }
            ctx.strokeStyle = '#ff0000';
            ctx.strokeRect(b.x, b.y, b.width, b.height);
        }
    };

    /**
     * Create a block by specifying a type and its position
     * @constructor
     */
    var Block = function(type, x, y) {
        // Use the constructor of its parent class Entity
        // Set the boundary of the entity inside its image
        var bounds = { x: 0, y: 50, width: blockWidth, height: blockHeight };
        Entity.call(this, Block.types[type], x, y, 0, 0, bounds);
        this.type = type;
    };

    /** Inherit properties and functions from Entity class */
    Block.inheritsFrom(Entity);

    /** The block types with their image paths as its value */
    Block.types = {
        'G': 'grass-block.png',
        'S': 'stone-block.png',
        'W': 'water-block.png'
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
        // Set the boundary of the entity inside its image
        var bounds = { x: 16, y: blockHeight - 30, width: blockWidth - 31, height: blockHeight - 6 };
        // Use the constructor of its parent class Entity
        Entity.call(this, Player.characters[character], x, y, 0, -10, bounds);

        this.character = character;

        // Sets the speed of the player.
        this.speed = 1.5;

        this.animating = false;
        this.animationTimer = 0;
    };

    /** Inherit properties and functions from Entity class */
    Player.inheritsFrom(Entity);

    /** Get all the images used for Player */
    Player.getSprites = function() {
        return Helpers.getObjValues(Player.characters);
    };

    /** The player characters with their image paths as its value */
    Player.characters = {
        'boy': 'char-boy.png',
        'cat-girl': 'char-cat-girl.png',
        'pink-girl': 'char-pink-girl.png'
    };

    /** The list of valid moves with x and y changes it will make */
    Player.validMoves = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 }
    };

    /**
     * Set the this.movement variable that is used by the update method
     * to move the player. Note that we are not yet updating the x and y
     * location of the player here. The update function will be the one
     * who will update the player's position based on some conditions.
     *
     * @param {array} moves
     *         An array of valid moves as defined in Player.validMoves
     */
    Player.prototype.move = function(moves) {
        if (!moves || moves.length === 0) {
            this.movement = false;
            return;
        }

        /* This code allows us to move the player in two directions at
         * the same time (diagonally). E.g. when we press both up and left,
         * the player will move in the north east direction.
         */
        this.movement = { x: 0, y: 0};
        for (var move in moves) {
            var item = Player.validMoves[moves[move]];

            if (item) {
                this.movement.x += item.x;
                this.movement.y += item.y;
            }
        }
    };

    /** This function is used to stop the player from moving */
    Player.prototype.stop = function() {
        this.movement = false;
    };

    /**
     * Update the player's location in the grid.
     *
     * It uses the movement variable which is set in the move function to
     * update the player's location on the grid. It first check if the new
     * location is within the grid before updating the location.
     *
     * @param {number} dt
     *        The delta time or the elapsed time since last update
     */
    Player.prototype.update = function(dt) {
        var movement = this.movement;
        if (!this.animating && movement) {
            var distance = this.speed * dt;
            var newX = this.x + (movement.x * distance);
            var newY = this.y + (movement.y * distance);

            var grid = Resources.getGrid();
            /* Check if the newX position is within the grid before setting it */
            if (Helpers.withinGrid({ x: newX, y: this.y }, grid.nRows, grid.nColumns)) {
                this.x = newX;
            }
            /* Check if the newY position is within the grid before setting it */
            if (Helpers.withinGrid({ x: this.x, y: newY }, grid.nRows, grid.nColumns)) {
                this.y = newY;
            }
        }

        if (this.dead) {
            this.deathAnimation(dt);
        } else if (this.goal) {
            this.goalAnimation(dt);
        }
    };

    /**
     * Animate the opacity of the player when it hits the enemy before resetting
     * its position
     */
    Player.prototype.deathAnimation = function(dt) {
        this.animationTimer -= dt;
        this.animationTime += dt * 5;
        if (this.animationTimer <= 0) {
            // make the player alive and reset its position

            this.setDead(false, !Resources.isGameOver());
            if (typeof this.deathCallback == 'function') {
                this.deathCallback();
            }
        } else {
            this.opacity = Math.abs(Math.sin(1 - this.animationTime));
        }
    };

    /**
     * Animate the translate Y position of the player to emulate a jump animation
     * when it hits the water
     */
    Player.prototype.goalAnimation = function(dt) {
        this.animationTimer -= dt;
        this.animationTime += dt * 5;
        if (this.animationTimer <= 0) {
            // make the player alive and reset its position
            this.setGoal(false, true);
            if (typeof this.goalCallback == 'function') {
                this.goalCallback();
            }
        } else {
            this.translate.y = Math.abs(Math.sin(this.animationTime)) * -15;
        }
    };

    /**
     * This function resets the position and properties of the player.
     */
    Player.prototype.reset = function() {
        this.opacity = 1;
        this.translate = { x:0, y: 0 };
        var grid = Resources.getGrid();
        /* select a random x position */
        var xPos = Math.floor(Math.random() * grid.nColumns);
        this.x = xPos;
        /* Set the Y position to a random Grass row */
        this.y = Helpers.randomIndex(grid.rows, 'G');
    };

    /**
     * Flag the player as dead and set the animation timer
     * @param {boolean} dead
     *        Whether the player is dead or not
     * @param {boolean} reset
     *        Whether the players position should be reset or not
     */
    Player.prototype.setDead = function(dead, reset) {
        this.dead = dead;
        this.setAnimating(dead, 2);
        this.opacity = 1;

        if (reset) {
            this.reset();
        }
    };

    /** Set the variables used for player animation */
    Player.prototype.setAnimating = function(animate, time) {
        this.animating = animate;
        this.animationTimer = animate ? time : 0;
        this.animationTime = 0;
    };

    /**
     * Flag the player as having won a goal(reached the water) and set the animation timer
     * @param {boolean} goal
     *        Whether the player has won a goal or not
     * @param {boolean} reset
     *        Whether the players position should be reset or not
     */
    Player.prototype.setGoal = function(goal, reset) {
        this.goal = goal;
        this.setAnimating(goal, 2);

        if (reset) {
            this.reset();
        }
    };

    /**
     * Create an Enemy by specifying its position and speed
     * @constructor
     */
    var Enemy = function(maxSpeed, x, y) {
        // Set the boundary of the entity inside its image
        var bounds = { x: 2, y: blockHeight - 26, width: blockWidth - 4, height: blockHeight - 16 };

        // Use the constructor of its parent class Entity
        Entity.call(this, Enemy.sprite, x, y, 0, -20, bounds);
        this.maxSpeed = maxSpeed || 2.5;
        this.speed = maxSpeed;
    };

    /** Inherit properties and functions from Entity class */
    Enemy.inheritsFrom(Entity);

    /** The image of the enemy */
    Enemy.sprite = "enemy-bug.png";

    /**
     * Update the position of the enemy by passing the delta time
     * @param {float} dt
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

        /* Set the Y position to a random Stone row */
        this.y = Helpers.randomIndex(Resources.getGrid().rows, 'S');

        /* Set the speed.
         * Minimum is 1 block per second and max is 3 blocks per second.
         */
        this.speed = 1 + Math.random() * (this.maxSpeed - 1);
    };

    /**
     * Create a new heart specifying its X location
     * @constructor
     */
    var Heart = function(x) {
        Entity.call(this, Heart.sprite, x, 0, x * -55, -15);
        this.scale = 0.4;
        this.checkBounds = false;
    };
    Heart.sprite = 'heart.png';

    /** Inherit properties and functions from Entity class */
    Heart.inheritsFrom(Entity);

    /**
     * Create a Collectible entity which will become the parent of other
     * collectible items
     * @constructor
     * @param {mixed} sprites
     *      Either a string or array of string of images
     * @param {number} offsetX
     *        The collectible's horizontal offset position
     * @param {number} offsetY
     *        The collectible's vertical offset position
     * @param {object} bounds
     *        The rectangle of the collectible inside its image
     */
    var Collectible = function(sprites, offsetX, offsetY, bounds) {
        var grid = Resources.getGrid();

        var sprite = sprites;
        if (sprites instanceof Array) {
            // Pick a random item if an array
            sprite = Helpers.randomItem(sprites);
        }

        // Select a random Stone row
        var y = Helpers.randomIndex(grid.rows, 'S');
        var x = Math.floor(Math.random() * grid.nColumns);

        Entity.call(this, sprite, x, y, offsetX, offsetY, bounds);
    };

    /** Inherit properties and functions from Entity class */
    Collectible.inheritsFrom(Entity);

    /**
     * Create a new Gem collectible by specifying its type and position
     * @constructor
     */
    var Gem = function() {
        // Set the boundary of the entity inside its image
        var bounds = { x: 13, y: blockHeight - 30, width: blockWidth - 27, height: blockHeight - 6 };

        Collectible.call(this, Gem.getSprites(), 12, 9, bounds);
        this.scale = 0.75;
    };

    /** Inherit properties and functions from Entity class */
    Gem.inheritsFrom(Collectible);

    /** Types of gem */
    Gem.types = {
        blue: 'gem-blue.png',
        green: 'gem-green.png',
        orange: 'gem-orange.png'
    };

    /** Get all the images used for Gem */
    Gem.getSprites = function() {
        return Helpers.getObjValues(Gem.types);
    };

    /**
     * Create a new Star collectible that will add life
     * @constructor
     */
    var Star = function() {
        // Set the boundary of the entity inside its image
        var bounds = { x: 13, y: blockHeight - 25, width: blockWidth - 27, height: blockHeight - 16 };
        Collectible.call(this, Star.sprite, 0, -10, bounds);
        //this.scale = 0.75;
    };

    Star.sprite = 'star.png';

    /** Inherit properties and functions from Entity class */
    Star.inheritsFrom(Collectible);

    /**
     * Create a new Key collectible that will change the row blocks
     * and give extra points
     * @constructor
     */
    var Key = function() {
        // Set the boundary of the entity inside its image
        var bounds = { x: 30, y: blockHeight - 30, width: blockWidth - 60, height: blockHeight - 6 };
        Collectible.call(this, Key.sprite, 4, 2, bounds);
        this.scale = 0.9;
    };

    Key.sprite = 'key.png';

    /** Inherit properties and functions from Entity class */
    Key.inheritsFrom(Collectible);

    /* Expose the entities to the outside world so that they can be used in other scripts */
    window.Player = Player;
    window.Block = Block;
    window.Enemy = Enemy;
    window.Heart = Heart;
    window.Gem = Gem;
    window.Star = Star;
    window.Key = Key;
})();