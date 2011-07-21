var _ = require('underscore'),
    GameTime = require('../GameTime.js');

var GameServer = module.exports = function(socket) {
    this.socket = socket;
    this.time = new GameTime();
    this.tickTime = 1000.0 / 3.0; // approx. time between ticks
};

// start game loop
GameServer.prototype.start = function() {
    this.tick = _.bind(this.tick, this);
    // I'm not sure how efficient the above closure is. Perhaps it would be better to have a universal game loop that iterates through all live games and calls their tick method.
    // static GameServer.tick function():
    //     for game in games_that_started:
    //         game.tick()
    //     setTimeout(GameServer.tick, tickTime)
    
    
    this.tick();
};

GameServer.prototype.tick = function() {
    this.time.update();
    this.socket.emit('time-updated', this.time.millis);
    setTimeout(this.tick, this.tickTime);
};
