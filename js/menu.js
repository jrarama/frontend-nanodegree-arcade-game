(function() {
    var gameTitle = 'Go For Water';
    function GameTitle() {
        this.timer = 0;
        this.y = 0;
    }

    GameTitle.prototype.update = function(dt) {
        this.timer += dt;
        if (this.timer > 5) {
            this.timer = 5;
        }

        this.y = this.timer < 4 ? ease(this.timer) : ease(5 - this.timer);
    };

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

    function Menu() {
        this.title = new GameTitle();
        this.begin = true;
        this.paused = false;
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

    Menu.prototype.update = function(dt) {
        this.title.update(dt);
        this.timer += dt;
    };

    Menu.prototype.render = function() {
        this.title.render();
    };


    window.GameMenu = Menu;
})();