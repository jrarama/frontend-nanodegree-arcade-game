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
    var blockWidth = 101;

    /**
     * Create an Entity by specifying its sprite and its position
     * @constructor
     * @param {{string}} sprite
     *        The path of entity's image
     * @param {{number}} x
     *        The entity's X position
     * @param {{number}} y
     *        The entity's Y position
     * @param {{number}} offsetX
     *        The entity's horizontal offset position
     * @param {{number}} offsetY
     *        The entity's vertical offset position
     * @param {{object}} bounds
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
        this.offsetX = offsetX || 0;
        this.offsetY = offsetY || 0;
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
            ctx.globalAlpha = this.opacity;
            ctx.drawImage(img, this.x * blockWidth + this.offsetX, this.y * blockHeight + this.offsetY);
            ctx.globalAlpha = 1.0;

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
        Entity.call(this, Block.types[type], x, y);
        this.type = type;

        /* We don't want to display rectangle bounds for blocks
         * since we will not check for collision with it.
         */
        this.checkBounds = false;
    };

    /** Inherit properties and functions from Entity class */
    Block.inheritsFrom(Entity);

    /** The block types with their image paths as its value */
    Block.types = {
        'G': 'images/grass-block.png',
        'S': 'images/stone-block.png',
        'W': 'images/water-block.png'
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
        'boy': 'images/char-boy.png',
        'cat-girl': 'images/char-cat-girl.png',
        'pink-girl': 'images/char-pink-girl.png'
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
     * @param {{array}} moves
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
     * @param {{number}} dt
     *        The delta time or the elapsed time since last update
     */
    Player.prototype.update = function(dt) {
        var movement = this.movement;
        if (!this.animating && movement) {
            var distance = this.speed * dt;
            var newX = this.x + (movement.x * distance);
            var newY = this.y + (movement.y * distance);

            var grid = Resources.getGrid();
            /* Check if the new positions are within the grid before setting it */
            if (Helpers.withinGrid({ x: newX, y: newY }, grid.nRows, grid.nColumns)) {
                this.x = newX;
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
            this.setDead(false, true);
        } else {
            this.opacity = Math.abs(Math.sin(1 - this.animationTime));
        }
    };

    /**
     * Animate the opacity of the player when it hits the water
     */
    Player.prototype.goalAnimation = function(dt) {
        this.animationTimer -= dt;
        this.animationTime += dt * 5;
        if (this.animationTimer <= 0) {
            // make the player alive and reset its position
            this.setGoal(false, true);
        } else {
            // TODO: change the animation for goal
            this.opacity = Math.abs(Math.sin(1 - this.animationTime));
        }
    };

    /**
     * This function resets the position of the player in its initial y
     * position and random x position.
     */
    Player.prototype.reset = function() {
        this.opacity = 1;
        var grid = Resources.getGrid();
        /* select a ramdom x position */
        var xPos = Math.floor(Math.random() * grid.nColumns);
        this.x = xPos;
        /* Set the Y position to a random Grass row */
        this.y = Helpers.randomIndex(grid.rows, 'G');
    };

    /**
     * Flag the player as dead and set the animation timer
     * @param {{boolean}} dead
     *        Whether the player is dead or not
     * @param {{boolean}} reset
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

    Player.prototype.setAnimating = function(animate, time) {
        this.animating = animate;
        this.animationTimer = animate ? time : 0;
        this.animationTime = 0;
    };

    /**
     * Flag the player as having won a goal and set the animation timer
     * @param {{boolean}} goal
     *        Whether the player has won a goal or not
     * @param {{boolean}} reset
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
    var Enemy = function(x, y, speed) {
        // Set the boundary of the entity inside its image
        var bounds = { x: 2, y: blockHeight - 26, width: blockWidth - 4, height: blockHeight - 16 };

        // Use the constructor of its parent class Entity
        Entity.call(this, Enemy.sprite, x, y, 0, -20, bounds);
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

        /* Set the Y position to a random Stone row */
        this.y = Helpers.randomIndex(Resources.getGrid().rows, 'S');

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