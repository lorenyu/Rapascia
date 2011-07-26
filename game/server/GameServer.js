var _ = require('underscore'),
    GameTime = require('../GameTime.js'),
    Player = require('../models/Player.js');

var GameServer = module.exports = function(game, socket) {
    this.game = game;
    this.socket = socket;
    this.time = new GameTime();
    this.tickTime = 1000.0 / 3.0; // approx. time between ticks
    this.commands = [];
    
    var self = this;
    socket.on('connection', function(playerClient) {
        var player = new Player();
        player.joinGame(game);
        socket.emit('player-joined', {
            name: player.name
        });
        playerClient.on('start-game', function() {
            if (!game.timeStarted) {
                self.start();
            }
        });
        playerClient.once('disconnect', function() {
            playerClient.broadcast.emit('player-left', {
                name: player.name
            });
        });
        playerClient.on('player-command', function(command) {
            console.log('player-command');
            console.log(command);
            self.commands.push(command);
        });
    });
};

// start game loop
GameServer.prototype.start = function() {
    this.game.timeStarted = new Date().getTime();
    
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
    this.socket.emit('tick', {
        time: this.time.millis,
        commands: this.commands
    });
    this.commands.length = 0; // clear commands
    setTimeout(this.tick, this.tickTime);
};
