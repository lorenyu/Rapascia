var _ = require('underscore'),
    GameTime = require('../GameTime.js');

var GameServer = module.exports = function(socket) {
    this.socket = socket;
    this.time = new GameTime();
    this.tickTime = 1000.0 / 3.0; // approx. time between ticks
};

// start game loop
GameServer.prototype.start = function() {
    this.tick();
};

GameServer.prototype.tick = function() {
    this.time.update();
    this.socket.emit('time-updated', this.time.millis);
    setTimeout(_.bind(this.tick, this), this.tickTime);
};
