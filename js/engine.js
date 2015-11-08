/**
 * Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in the entities.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 */

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

        /* Initialize all entities */
        initEntities();

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
                score = 0;
                lives--;

                Resources.setGameOver(lives === 0);
                player.setDead(true);
                return;
            }
        });

        return !player.dead;
    }

    function checkPowerUps() {
        if (player.animating) {
            return;
        }
        // Get the indices of water
        var ind = Helpers.blockIndices(Resources.getGrid().rows, 'W');
        var y = Math.round(player.y + 0.4);
        if (ind.indexOf(y) > -1) {
            player.y = y;
            score++;
            player.setGoal(true);
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        blocks.forEach(function(block) {
            block.render();
        });

        for(i = 0; i < allLives.length; i ++) {
            heart = allLives[i];
            heart.opacity = i >= lives ? 0.4 : 1;
            heart.render();
        }

        renderEntities();

        renderScore();

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

    /**
     * This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        Resources.setGameOver(false);
        paused = false;
        score = 0;
        lives = 3;
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
        images.push(Enemy.sprite);
        images.push(Heart.sprite);

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
    }

    /**
     * Initialize all the enemies. We create 3 enemies by default and set
     * their position and speed randomly by calling its reset function.
     */
    function initEnemies() {
        var i;
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