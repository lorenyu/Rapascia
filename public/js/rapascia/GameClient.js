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
    
    // UI properties
    this._selectedTile = null;
    this._selectedUnits = null;
};
Game.prototype.players = function() {
    return this._players;
};
Game.prototype.map = function() {
    return this._map;
};
Game.prototype.addPlayer = function(player) {
    var startingPosition;
    
    this.players().push(player);
    switch (player.index()) {
        case 1:
            startingPosition = this.map().tiles()[0][0];
            break;
        case 2:
            startingPosition = this.map().tiles()[11][11];
            break;
        case 3:
            startingPosition = this.map().tiles()[0][11];
            break;
        case 4:
            startingPosition = this.map().tiles()[11][0];
            break;
    }
    
    // add 4 units for the player
    _.each(_.range(4), function() {
        startingPosition.units().push(new Unit(player));
    });
};
// UI methods
Game.prototype.selectedTile = function(tile) {
    if (tile === undefined) {
        return this._selectedTile;
    }
    this._selectedTile = tile;
};
Game.prototype.selectedUnits = function(units) {
    if (units === undefined) {
        return this._selectedUnits;
    }
    this._selectedUnits = units;
};

/**
 * Map Model
 */
var Map = Rapascia.models.Map = function() {

    // hardcode map for now
    var numRows = this.numRows = 12,
        numCols = this.numCols = 12,
        tiles = this._tiles = [], tile,
        i,
        j;
    for (i = 0; i < numRows; i += 1) {
        tiles.push([]);
        for (j = 0; j < numCols; j += 1) {
            tile = new Tile(this, numCols*i + j);
            tile.index = numCols*i + numCols;
            tile.i = i;
            tile.j = j;
            tiles[i].push(tile);
        }
    }
};
Map.prototype.tiles = function() {
    return this._tiles;
};
Map.prototype.isAdjacent = function(tileA, tileB) {
    var rowA = Math.floor(tileA.id() / this.numCols),
        colA = tileA.id() % this.numCols,
        rowB = Math.floor(tileB.id() / this.numCols),
        colB = tileB.id() % this.numCols;
    return Math.abs(rowA - rowB) + Math.abs(colA - colB) == 1;
};

/**
 * Tile Model
 */
var Tile = Rapascia.models.Tile = function(map, id) {
    this._map = map;
    this._id = id;
    this._units = [];
    Tile._tilesById[id] = this;
};
Tile._tilesById = {};
Tile.get = function(id) {
    return Tile._tilesById[id];
};
Tile.prototype.map = function() {
    return this._map;
};
Tile.prototype.id = function() {
    return this._id;
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
Tile.prototype.isAdjacentTo = function(tile) {
    return this.map().isAdjacent(this, tile);
};

/**
 * Unit Model
 */
var Unit = Rapascia.models.Unit = function(player) {
    this._id = Unit._nextId;
    Unit._nextId += 1;
    this._player = player;
    this._mode = 'stopped';
    this._health = 10;
    this._cooldown = 0;
    
    Unit._unitsById[this._id] = this;
};
Unit._nextId = 1;
Unit._unitsById = {};
Unit.get = function(id) {
    return Unit._unitsById[id];
};
Unit.prototype.id = function() {
    return this._id;
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
    this._index = Player.nextIndex();
};
Player.nextIndex = (function() {
    var index = 1;
    return function() {
        index += 1;
        return index - 1;
    };
})();
Player.prototype.index = function() {
    return this._index;
};
Player.prototype.color = function() {
    switch (this._index) {
    case 1: return 'red';
    case 2: return 'blue';
    case 3: return 'green';
    case 4: return 'magenta';
    case 5: return 'orange';
    case 6: return 'cyan';
    }
    return 'gray';
};

/*************
 * Renderers *
 *************/
 
var jade = require('jade');

Rapascia.renderers = {};

$.get('/jade/game.jade', function(data) {
    Rapascia.renderers.gameRenderer = jade.compile(data);
    $(Rapascia).trigger('game-renderer-ready');
});

$.get('/jade/move-options.jade', function(data) {
    Rapascia.renderers.moveOptionsRenderer = jade.compile(data);
});

Rapascia.renderers.playerRenderer = jade.compile('li.player(name=this.name)= this.name');

/**************
 * GameClient *
 **************/
var GameClient = Rapascia.GameClient = function(socket) {
    
    this.player = null;
    this.game = new Rapascia.models.Game();
    this.socket = socket;
    
    socket.on('tick', $.proxy(this.tick, this));
    socket.on('player-joined', $.proxy(function(playerData) {
        $('.players').append(Rapascia.renderers.playerRenderer.call(playerData)); // temporary for debugging
        
        var player = new Player(playerData);
        this.game.addPlayer(player);
        if (playerData.isMe) {
            this.player = player;
        }
        
    }, this));
    socket.on('player-left', $.proxy(function(player) {
        $('li.player[name=' + player.name + ']').remove(); // temporary
    }, this));
    
    // NOTE: we're using mousedown instead of click since the game sometimes
    // re-renders in the middle of a click (between the mousedown and mouseup)
    // so the click never fires
    $(document).bind('contextmenu', function() { return false; });
    $('.tile').live('mousedown', this, function(event) {
        var $this = $(this),
            gameClient = event.data,
            tile = Tile.get(parseInt($this.attr('tileid'), 10));
        
        switch (event.which) {
        case 1: // left mouse button
            gameClient.game.selectedTile(tile);
            $('.tile.selected').removeClass('selected');
            $this.addClass('selected');
            break;
        case 2: // middle mouse button
            break;
        case 3: // right mouse button
            if (gameClient.game.selectedTile().isAdjacentTo(tile) &&
                gameClient.player === gameClient.game.selectedTile().player()) { // if player controls the selected tile
                
                // move units
                console.log('Moving units ' + gameClient.game.selectedUnits() + ' to tile ' + tile.id());
                gameClient.sendCommand(new Rapascia.commands.Move(gameClient.game.selectedUnits(), tile));
            }
            break;
        }
        return false;
    });
    
    $('.tile .units .unit').live({
        'mouseover': function(event) {
            $this = $(this);
            $this.nextAll().removeClass('selecting');
            var numUnits = $this.prevAll().andSelf().addClass('selecting').length;
        },
        'mouseout': function(event) {
            $this = $(this);
            $this.siblings('.unit').andSelf().removeClass('selecting');
        },
        'mousedown': function(event) {
            $this = $(this);
            var units = $this.prevAll().andSelf().addClass('selected').map(function() {
                return Unit.get($(this).attr('unitid'));
            });
            //console.log(units);
            gameClient.game.selectedUnits(units);
        }
    });
    $('.tile .move-all-units-btn').live('mouseover', function(event) {
        $this = $(this);
        var numUnits = $this.parents('.tile').find('.unit').addClass('selecting').length;
        $this.parents('.tile').find('.num-units').text(numUnits);
    });
    
    $('.btn[action]').click(function(event) {
        var action = $(this).attr('action');
        socket.emit(action);
    });
};
GameClient.prototype.tick = function(data) {
    $('.time').text(data.time); // for debugging
    
    var commands = data.commands,
        time = data.time,
        timeElapsed;
    
    timeElapsed = time - this.time;    
    
    // process player commands
    _.each(commands, _.bind(this.execute, this));
    
    // update game state
    
    // render
    
    
    this.time = time;
};
GameClient.prototype.execute = function(command) {
    switch (command.name) {
    case 'start-game': $('.game').html(Rapascia.renderers.gameRenderer.call(this.game));
        break;
    }
};
GameClient.prototype.sendCommand = function(command) {
    this.socket.emit('player-command', command);
};

/***********************
 * Command Definitions *
 ***********************/
 
Rapascia.commands = {};
var MoveCommand = Rapascia.commands.Move = function(units, destination) {
    console.log(units);
    this.name = 'move';
    this.units = _.map(units, function(unit) {
        return unit.id();
    });
    this.destination = destination.id();
};

})(window);
