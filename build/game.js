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
/* Resources.js
 * This is simple an image loading utility. It eases the process of loading
 * image files so that they can be used within your game. It also includes
 * a simple "caching" layer so it will reuse cached images if you attempt
 * to load the same image multiple times.
 */
(function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

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
        isReady: isReady
    };
})();

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
/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

(function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        columns = 5,
        rows = ['water', 'stone', 'stone', 'stone', 'grass', 'grass'],
        nRows = rows.length,
        player = null,
        allEnemies = [],
        blocks = [],
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
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
        update(dt);
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

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        initEntities();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        // checkCollisions();
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        /*allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();*/
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        blocks.forEach(function(block) {
            block.render();
        });

        player.render();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {

    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    function loadResources() {
        var images = [];
        images = images.concat(Player.getSprites());
        images = images.concat(Block.getSprites());

        Resources.load(images);
        Resources.onReady(init);
    }

    function initEntities() {
        allEnemies = [];
        blocks =  [];

        var characters = Helpers.getObjKeys(Player.characters);
        var charInd = Math.floor(Math.random() * characters.length);
        var xPos = Math.floor(Math.random() * columns);
        player = new Player(ctx, characters[charInd], xPos, rows.length - 1);
        initBlocks();
    }

    function initBlocks() {
        var row, col;

        for (row = 0; row < nRows; row++) {
            for (col = 0; col < columns; col++) {
                blocks.push(new Block(ctx, rows[row], col, row));
            }
        }
    }

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

    doc.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        if (player) {
            player.move(allowedKeys[e.keyCode], nRows, columns);
        }
    });

    window.Engine = {
        init: loadResources
    };

})(this);
Engine.init();