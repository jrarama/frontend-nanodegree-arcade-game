/* Menu.js
 * All entities for drawing for the game title and game menus will be placed here.
 */
(function() {
    var gameTitle = 'Go For Water';

    /**
     * The Game title
     */
    function GameTitle() {
        this.timer = 0;
        this.y = 0;
    }

    /**
     * Update the Y position of the Game title based on delta time
     */
    GameTitle.prototype.update = function(dt) {
        this.timer += dt;
        if (this.timer > 5) {
            this.timer = 5;
        }

        this.y = this.timer < 4 ? ease(this.timer) : ease(5 - this.timer);
    };

    /** Render the game title */
    GameTitle.prototype.render = function() {
        var ctx = Resources.getContext();
        ctx.save();
        ctx.font = '56px Exo';
        ctx.textAlign = 'center';
        var w2 = 252.5;
        var h2 = 303 * this.y;

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 8;
        ctx.strokeText(gameTitle, w2, h2);

        ctx.fillStyle = '#eee';
        ctx.fillText(gameTitle, w2, h2);

        ctx.restore();
    };

    /** The game menu entity */
    function Menu() {
        /* Create a title property for the menu */
        this.title = new GameTitle();

        /* TODO: Add other properties for the menus, such as player selection screen,
         * pause menu, etc.
         */

        this.timer = 0;
    }

    /**
     * A refactored version of easeOutElastic from
     * https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
     */
    function ease(t) {
        var c = 1, d = 1, p = 0.3;
        if (t === 0) { return 0; }
        if ((t/=d)===1) { return 1; }
        var s = p/(2*Math.PI) * Math.asin (1);
        return Math.pow(2,-10*t) * Math.sin((t*d-s)*(2*Math.PI)/p ) + 1;
    }

    /** Update all the menu entities */
    Menu.prototype.update = function(dt) {
        this.title.update(dt);
        // TODO: other Menu entities' update calls
        this.timer += dt;
    };

    /** Render all the menu entities */
    Menu.prototype.render = function() {
        this.title.render();
        // TODO: other Menu entities' render calls
    };

    /** Expose the Menu globally as GameMenu */
    window.GameMenu = Menu;
})();