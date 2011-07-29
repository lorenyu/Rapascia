(function(window, undefined ) {
    
var Rapascia = window.Rapascia = {};

/***************
 * Game Models *
 ***************/

Rapascia.models = {};

/**
 * Game Model
 */
var Game = Rapascia.models.Game = function() {
    this._players = [];
    this._map = new Map();
};
Game.prototype.players = function() {
    return this._players;
};
Game.prototype.map = function() {
    return this._map;
};

/**
 * Map Model
 */
var Map = Rapascia.models.Map = function() {

    // hardcode map for now
    var numRows = 12,
        numCols = 12,
        tiles = [], tile,
        i,
        j;
    for (i = 0; i < numRows; i += 1) {
        tiles.push([]);
        for (j = 0; j < numCols; j += 1) {
            tile = new Tile(numCols*i + numCols);
            tile.index = numCols*i + numCols;
            tile.i = i;
            tile.j = j;
            tiles[i].push(tile);
        }
    }

    this._tiles = tiles;
};
Map.prototype.tiles = function() {
    return this._tiles;
};

/**
 * Tile Model
 */
var Tile = Rapascia.models.Tile = function(id) {
    this._id = id;
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

/**
 * Unit Model
 */
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

/**
 * Player Model
 */
var Player = Rapascia.models.Player = function() {
};

/*************
 * Renderers *
 *************/
 
var jade = require('jade');

Rapascia.renderers = {};

$.get('/jade/game.jade', function(data) {
    Rapascia.renderers.gameRenderer = jade.compile(data);
});

/**************
 * GameClient *
 **************/
var GameClient = Rapascia.GameClient = function(socket) {
    
    this.game = new Rapascia.models.Game();
    
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
    
    // render
    console.log(Rapascia.renderers.gameRenderer.call(this.game));
    $('.game').html(Rapascia.renderers.gameRenderer.call(this.game));
    
    this.time = time;
};

GameClient.prototype.sendCommand = function(command) {
    this.socket.emit('player-command', command);
};

})(window);
