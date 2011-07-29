var Map = require('./Map.js');

var Game = module.exports = function() {
    this.id = Math.random();
    this.timeStarted = null;
    this.players = [];
    
    this.addPlayer = function(player) {
        this.players.push(player);
    };
    
    this.removePlayer = function(player) {
        //Apparently this doesn't work in ie...
        this.players.splice(this.players.indexOf(player), 1);
    };
};
