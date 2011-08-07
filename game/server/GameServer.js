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
        
        _.each(game.players, function(player) {
            playerClient.emit('player-joined', {
                name: player.name
            });
        });
        
        player.joinGame(game);
        
        // tell everyone else the player joined
        playerClient.broadcast.emit('player-joined', {
            name: player.name
        });
        
        // tell the player who he is
        playerClient.emit('player-joined', {
            id: player.id,
            name: player.name,
            isMe: true
        });
        
        
        playerClient.on('start-game', function() {
            if (!game.timeStarted) {
                self.commands.push({
                    name: 'start-game'
                });
                self.start();
            }
        });
        playerClient.once('disconnect', function() {
            playerClient.broadcast.emit('player-left', {
                name: player.name
            });
        });
        playerClient.on('player-command', function(command) {
            command.time = new Date().getTime();
            self.commands.push(command);
            console.log('player-command:');
            console.log(command);
        });
    });
};

// start game loop
GameServer.prototype.start = function() {
    this.game.timeStarted = new Date().getTime();
    
    this.time.update();
    this.socket.emit('game-start', {
        time: this.time.millis
    });
    
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
