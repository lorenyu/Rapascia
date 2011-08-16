(function(Rapascia, undefined ) {
    
var util = Rapascia.util;

var Timer;
Rapascia.require('Rapascia.models.Timer', function(cls) { Timer = cls; });

var Turn = Rapascia.define('Rapascia.models.Turn', function(time) {
    this._player = null;
    this._timer = new Rapascia.models.Timer(time);
});
Turn.SECONDS_PER_TURN = 3;
Turn.prototype.start = function() {
    this._timer.start();
};
Turn.prototype.tick = function(time) {
    if (this.timeLeft() <= 0) {
        $(this).trigger('turn-ended', this);
    }
};
Turn.prototype.turnLength = function() { // NOTE: Do not name the function "length" as that will screw up jQuery's $() function, so "trigger" will no longer work
    return Turn.SECONDS_PER_TURN * 1000;
};
Turn.prototype.timeLeft = function() {
    return this.turnLength() - this._timer.timeElapsed();
};
Turn.prototype.player = function(player) {
    if (player === undefined) {
        return this._player;
    }
    this._player = player;
    return this;
};

})(Rapascia);
