(function(window, undefined ) {
    
var Rapascia = window.Rapascia = {};

/**********************
 * Define Game Models *
 **********************/

Rapascia.models = {};

/**************
 * Game Model *
 **************/
var Game = Rapascia.models.Game = function() {
    this._tiles = [];
    this._players = [];
    this._units = [];
};
Game.prototype.tiles = function() {
    return this._tiles;
};
Game.prototype.players = function() {
    return this._players;
};
Game.prototype.units = function() {
    return this._units;
};

/**************
 * Tile Model *
 **************/
var Tile = Rapascia.models.Tile = function() {
    this._units = [];
};
Tile.prototype.units = function() {
    return this._units;
};
Tile.prototype.player = function() {
    if (this.units().length > 0) {
        return this.units()[0].player();
    }
    return null;
};

/**************
 * Unit Model *
 **************/
var Unit = Rapascia.models.Unit = function(player) {
    this._player = player;
    this._mode = 'stopped';
    this._health = 10;
    this._cooldown = 0;
};
Unit.prototype.player = function() {
    return this._player;
};
Unit.prototype.mode = function() {
    if (arguments.length === 0) {
        return this._mode;
    }
    this._mode = arguments[0];
    return this;
};
Unit.prototype.damage = function() {
    var defaultDamage = 4;
    
    switch (this.mode()) {
    case 'defending': return 1.25 * defaultDamage;
    case 'producing': return 0.50 * defaultDamage;
    }
    return defaultDamage;
};
Unit.prototype.health = function() {
    return this._health;
};
Unit.prototype.isTransitioning = function() {
    return this._cooldown > 0;
};

/****************
 * Player Model *
 ****************/
var Player = Rapascia.models.Player = function() {
};

/***********************
 * Defining GameClient *
 ***********************/
var GameClient = Rapascia.GameClient = function(socket) {
    this.socket = socket;
    socket.on('tick', $.proxy(this.tick, this));
};
GameClient.prototype.tick = function(data) {
    $('.time').text(data.time); // for debugging
    
    var commands = data.commands,
        time = data.time,
        timeElapsed;
    
    timeElapsed = time - this.time;    
    
    // process player commands
    
    // update game state
    
    this.time = time;
};

GameClient.prototype.sendCommand = function(command) {
    this.socket.emit('player-command', command);
};

})(window);
