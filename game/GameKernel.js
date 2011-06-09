
var GameKernel = this.exports = function() {
    
};

GameKernel.prototype.update = function(millis) {
    while (this._nextTick < millis) {
        this.tick();
    }
};

GameKernel.prototype.tick = function() {
    var dt = 1 / 60.0; // tickTime
    this._gameState = {
        time: _nextTick
    };
    this._nextTick += dt;
};
