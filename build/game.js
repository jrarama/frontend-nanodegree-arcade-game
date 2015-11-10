/**
 * frontend-nanodegree-arcade-game - v0.1.0 - 2015-11-10
 * This is an autogenerated file which is a concatenation of all JS files in the 
 * "js/" directory. DO NOT edit this file.
 */
(function() {
    /** variable to draw a rectangle around the entity to visualize its the boundary */
    var drawBounds = false;

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
        },
        setDrawBounds: function(bool) {
            drawBounds = bool;
        },
        getDrawBounds: function() {
            return drawBounds;
        },
        /**
         * This function checks for collision between two rectangles
         * Each rectangle should have x, y, width and height properties
         */
        rectCollision: function(rect1, rect2) {
            return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height && rect1.height + rect1.y > rect2.y;
        },

        /**
         * return the indices the the blocks.
         * @param {{string}} blocks
         *      A string that contains G, S, or W;
         * @param {{string}} blockType
         *      A single letter that is either G, S, or W;
         */
        blockIndices: function(blocks, blockType) {
            var i, b = (blocks || ''), t = (blockType || '').slice(0);
            var ind = [];
            for(i = 0; i < b.length; i++) {
                if (b[i] == t) {
                    ind.push(i);
                }
            }
            return ind;
        },
        randomItem: function(array) {
            var rnd = Math.floor(Math.random() * array.length);
            return array[rnd];
        },
        /**
         * return a random index of a block type from a list of blocks
         * @param {{string}} blocks
         *      A string that contains G, S, or W only. E.g. "WSSSGG" means
         *      the first row is water, the 2nd to 4th row is stone and the
         *      last two rows will be grass.
         * @param {{string}} blockType
         *      A single letter that is either G, S, or W;
         */
        randomIndex: function(blocks, blockType) {
            var ind = Helpers.blockIndices(blocks, blockType);
            var rnd = Math.floor(Math.random() * ind.length);
            return ind[rnd];
        },

        /**
         * Shuffle an array
         */
        shuffleArray: function(array) {
            var currentIndex = array.length, temporaryValue, randomIndex ;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

          return array;
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
(function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];
    var context = null;
    var grid = { rows: "WSSSGG", nRows: 6, nColumns: 5 };
    var gameOver = false;

    /* This is the publicly accessible image loading function. It accepts
     * an array of strings pointing to image files or a string for a single
     * image. It will then call our private image loading function accordingly.
     */
    function load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            /* If the developer passed in an array of images
             * loop through each value and call our image
             * loader on that image file
             */
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        } else {
            /* The developer did not pass an array to this function,
             * assume the value is a string and call our image loader
             * directly.
             */
            _load(urlOrArr);
        }
    }

    /* This is our private image loader function, it is
     * called by the public image loader function.
     */
    function _load(url) {
        if(resourceCache[url]) {
            /* If this URL has been previously loaded it will exist within
             * our resourceCache array. Just return that image rather
             * re-loading the image.
             */
            return resourceCache[url];
        } else {
            /* This URL has not been previously loaded and is not present
             * within our cache; we'll need to load this image.
             */
            var img = new Image();
            img.onload = function() {
                /* Once our image has properly loaded, add it to our cache
                 * so that we can simply return this image if the developer
                 * attempts to load this file in the future.
                 */
                resourceCache[url] = img;

                /* Once the image is actually loaded and properly cached,
                 * call all of the onReady() callbacks we have defined.
                 */
                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };

            /* Set the initial cache value to false, this will change when
             * the image's onload event handler is called. Finally, point
             * the images src attribute to the passed in URL.
             */
            resourceCache[url] = false;
            img.src = url;
        }
    }

    /* This is used by developer's to grab references to images they know
     * have been previously loaded. If an image is cached, this functions
     * the same as calling load() on that URL.
     */
    function get(url) {
        return resourceCache[url];
    }

    /* This function determines if all of the images that have been requested
     * for loading have in fact been completed loaded.
     */
    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    /* This function will add a function to the callback stack that is called
     * when all requested images are properly loaded.
     */
    function onReady(func) {
        readyCallbacks.push(func);
    }

    /* This object defines the publicly accessible functions available to
     * developers by creating a global Resources object.
     */
    window.Resources = {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady,

        /** Sets the canvas context */
        setContext: function(ctx) {
            context = ctx;
        },

        /** Gets the canvas context */
        getContext: function() {
            return context;
        },

        /** Sets the grid options */
        setGrid: function(rows, nColumns) {
            if (rows) {
                grid.rows = rows;
                grid.nRows = rows.length;
            }
            grid.nColumns = nColumns || grid.nColumns;
        },

        /** Gets the grid options */
        getGrid: function() {
            return grid;
        },

        setGameOver: function(over) {
            gameOver = over;
        },

        isGameOver: function() {
            return gameOver;
        }
    };
})();

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

            this.setDead(false, !Resources.isGameOver());
            if (typeof this.deathCallback == 'function') {
                this.deathCallback();
            }
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
            if (typeof this.goalCallback == 'function') {
                this.goalCallback();
            }
        } else {
            this.translate.y = Math.abs(Math.sin(this.animationTime)) * -15;
        }
    };

    /**
     * This function resets the position of the player in its initial y
     * position and random x position.
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
    Heart.sprite = 'images/heart.png';

    /** Inherit properties and functions from Entity class */
    Heart.inheritsFrom(Entity);


    var Collectible = function(sprites, offsetX, offsetY, bounds) {
        var grid = Resources.getGrid();

        var sprite = sprites;
        if (sprites instanceof Array) {
            sprite = Helpers.randomItem(sprites);
        }

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
        blue: 'images/gem-blue.png',
        green: 'images/gem-green.png',
        orange: 'images/gem-orange.png'
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

    Star.sprite = 'images/star.png';

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

    Key.sprite = 'images/key.png';

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
(function() {
    /**
     * Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = document,
        win = window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        player = null,
        allEnemies = [],
        allLives = [],
        blocks = [],
        lastTime,
        paused,
        score,
        level,
        changeRows,
        lives;

    Resources.setContext(ctx);
    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /** This variable is the definition of valid move keys */
    var movementKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    /** This is the map of current pressed movement keys */
    var pressedKeys = {
        left: false,
        right: false,
        up: false,
        down: false
    };

    var collectibles = {
        key: false,
        gem: false,
        life: false
    };

    function newGridRows() {
        var rows = Helpers.shuffleArray('SSSGG'.split('')).join('');
        rows = Helpers.shuffleArray(['W', rows]).join('');
        Resources.setGrid(rows);
    }

    function generateLevel(lvl) {
        collectibles = {
            key: lvl % 7 === 0,
            life: lvl % 5 === 0,
            gem: lvl % 2 === 0
        };
    }

    /**
     * This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */

        if (!paused) {
            update(dt);
        }
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /**
     * This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        /* Initialize the level */
        initLevel();

        lastTime = Date.now();
        main();
    }

    /**
     * This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data such as updating
     * the position of the enemies. We also implemented our collision detection
     * (when two entities occupy the same space, for instance when your character
     * should die) here.
     */
    function update(dt) {
        updateEntities(dt);

        if (!Resources.isGameOver()) {
            var ok = checkCollisions();
            if (ok) {
                checkPowerUps();
            }
        }
    }

    /**
     * This is called by the update function  and loops through all of the
     * entities defined in entities.js and calls their update() methods.
     * It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do the drawing in the
     * render methods.
     */
    function updateEntities(dt) {
        var nColumns = Resources.getGrid().nColumns;
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);

            if (enemy.x >= nColumns) {
                enemy.reset();
            }
        });
        player.update(dt);
    }

    function checkCollisions() {
        if (player.dead) {
            return false;
        }
        // check collision with enemies
        var rect1 = player.getBounds();

        allEnemies.forEach(function(enemy) {
            var rect2 = enemy.getBounds();
            if (Helpers.rectCollision(rect1, rect2)) {
                lives--;

                Resources.setGameOver(lives === 0);
                player.setDead(true);
                return;
            }
        });

        return !player.dead;
    }

    function checkGoal() {
        // Get the indices of water
        var ind = Helpers.blockIndices(Resources.getGrid().rows, 'W');
        var y = Math.round(player.y + 0.4);
        if (ind.indexOf(y) > -1) {
            player.y = y;
            score++;
            player.setGoal(true);
        }
    }

    function checkPowerUps() {
        if (player.animating) {
            return;
        }
        checkGoal();
        var rect2 = null, rect1 = player.getBounds();

        if (collectibles.gem) {
            rect2 = collectibles.gem.getBounds();
            if (Helpers.rectCollision(rect1, rect2)) {
                score += 1;
                collectibles.gem = false;
            }
        }
        if (collectibles.life) {
            rect2 = collectibles.life.getBounds();
            if (Helpers.rectCollision(rect1, rect2)) {
                lives++;
                if (lives > 3) {
                    lives = 3;
                }
                score += 2;
                collectibles.life = false;
            }
        }
        if (collectibles.key) {
            rect2 = collectibles.key.getBounds();
            if (Helpers.rectCollision(rect1, rect2)) {
                changeRows = true;
                score += 3;
                collectibles.key = false;
            }
        }
    }

    /**
     * This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        var i, heart;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        blocks.forEach(function(block) {
            block.render();
        });

        for(i = 0; i < allLives.length; i ++) {
            heart = allLives[i];
            heart.opacity = i >= lives ? 0.4 : 1;
            heart.render();
        }

        renderCollectibles();
        renderEntities();

        renderScore();
        renderLevel();

        if (Resources.isGameOver()) {
            renderGameOver();
        }
    }

    /**
     * This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities
     */
    function renderEntities() {
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    function renderCollectibles() {
        if (collectibles.key) {
            collectibles.key.render();
        }
        if (collectibles.life) {
            collectibles.life.render();
        }
        if (collectibles.gem) {
            collectibles.gem.render();
        }
    }

    /**
     * This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        generateLevel(0);
        Resources.setGameOver(false);
        paused = false;
        score = 0;
        lives = 3;
        level = 1;
        changeRows = false;
        pressedKeys = {
            left: false,
            right: false,
            up: false,
            down: false
        };
    }

    /**
     * This function first gets all the images used for all entities then
     * load asynchronously. When all images are now ready we can now
     * initialize the game by calling the init function.
     */
    function loadResources() {
        var images = [];
        images = images.concat(Player.getSprites());
        images = images.concat(Block.getSprites());
        images = images.concat(Gem.getSprites());

        images.push(Enemy.sprite);
        images.push(Heart.sprite);
        images.push(Star.sprite);
        images.push(Key.sprite);

        Resources.load(images);
        Resources.onReady(init);
    }

    /**
     * This function is called within the init function which is used
     * to initialize all the entities
     */
    function initEntities() {
        allEnemies = [];
        allLives = [];
        blocks =  [];

        initBlocks();
        initPlayer();
        initEnemies();
        initHearts();
    }

    function initLevel() {
        if (changeRows) {
            newGridRows();
            changeRows = false;
        }
        generateLevel(level);
        initCollectibles();

        initEntities();
    }

    function initCollectibles() {
        if (collectibles.key === true) {
            collectibles.key = new Key();
        }

        if (collectibles.life === true) {
            collectibles.life = new Star();
        }

        if (collectibles.gem === true) {
            collectibles.gem = new Gem();
        }
    }

    /** Initialize the player's properties */
    function initPlayer() {
        /* select a random character */
        var characters = Helpers.getObjKeys(Player.characters);
        var charInd = Math.floor(Math.random() * characters.length);

        /* create the player */
        player = new Player(characters[charInd]);
        player.reset();
        player.deathCallback = function() {
            if (Resources.isGameOver()) {
                paused = true;
            }
        };
        player.goalCallback = function() {
            ++level;
            initLevel();
        };
    }

    /**
     * Initialize all the enemies. We create 3 enemies by default and set
     * their position and speed randomly by calling its reset function.
     */
    function initEnemies() {
        var i, maxSpeed = 2 + (0.07 * level);
        for (i = 0; i < 3; i++) {
            var enemy = new Enemy();
            enemy.reset();
            allEnemies.push(enemy);
        }
    }

    /** Initialize all the blocks */
    function initBlocks() {
        var grid = Resources.getGrid(), nRows = grid.nRows, nColumns = grid.nColumns;
        var row, col;

        for (row = 0; row < nRows; row++) {
            for (col = 0; col < nColumns; col++) {
                blocks.push(new Block(grid.rows[row], col, row));
            }
        }
    }

    /**
     * Initialize hearts
     */
    function initHearts() {
        var i;
        for (i = 0; i < 3; i++) {
            var heart = new Heart(i);
            allLives.push(heart);
        }
    }

    /** Handle the keyboard keyup events. */
    doc.addEventListener('keyup', function(e) {
        var move = movementKeys[e.keyCode];
        if (move) {
            pressedKeys[move] = false;
            movePlayer();
        }

        switch (e.keyCode) {
            case 27: // Escape key
                if (!Resources.isGameOver()) {
                    paused = !paused; // Toggle pause
                } else {
                    init();
                }
                break;
        }
    });

    /** Handle the keyboard keydown events */
    doc.addEventListener('keydown', function(e) {
        var move = movementKeys[e.keyCode];
        if (move) {
            pressedKeys[move] = true;
            movePlayer();
        }
    });

    /**
     * Move only when player is already loaded and the game is not paused.
     */
    function movePlayer() {
        if (player && !paused) {
            var moves = [];
            for(var key in pressedKeys) {
                if (pressedKeys.hasOwnProperty(key) && pressedKeys[key]) {
                    moves.push(key);
                }
            }
            player.move(moves);
        }
    }

    /** Render the score on the top right corner */
    function renderScore() {
        ctx.save();

        ctx.font = '25px Exo';
        ctx.textAlign = 'right';

        ctx.strokeStyle = '#00f';
        ctx.strokeText('Score: ' + score, canvas.width - 10, 30);

        ctx.fillStyle = '#333';
        ctx.fillText('Score: ' + score, canvas.width - 10, 30);

        ctx.restore();
    }

    function renderLevel() {
        ctx.save();

        ctx.font = '25px Exo';
        ctx.textAlign = 'center';

        ctx.strokeStyle = '#00f';
        ctx.strokeText('Level ' + level, canvas.width / 2, 30);

        ctx.fillStyle = '#333';
        ctx.fillText('Level ' + level, canvas.width / 2, 30);

        ctx.restore();
    }

    /** Render the Game Over message when the game is over */
    function renderGameOver() {
        ctx.save();
        ctx.font = '48px Exo';
        ctx.textAlign = 'center';
        var w2 = canvas.width / 2;
        var h2 = canvas.height / 2;

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 8;
        ctx.strokeText('GAME OVER', w2, h2);

        ctx.fillStyle = '#eee';
        ctx.fillText('GAME OVER', w2, h2);

        ctx.font = '20px Exo';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#333';
        ctx.strokeText('Press ESC for New Game', w2, h2 + 50);

        ctx.fillStyle = '#fff';
        ctx.fillText('Press ESC for New Game', w2, h2 + 50);

        ctx.restore();
    }

    /**
     * Expose the engine to the outside world with only some few functions
     * made public.
     */
    window.Engine = {
        init: function(opts) {
            // Initilize grid options if present
            var o = opts || {};
            if (o.grid) {
                Resources.setGrid(o.grid.rows, o.grid.nColumns);
            }
            loadResources();
        }
    };

})();
Helpers.setDrawBounds(false);
Engine.init();