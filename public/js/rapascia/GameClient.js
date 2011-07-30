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
            tileId = parseInt($this.attr('tileid'), 10),
            tile = Tile.get(tileId);
        
        switch (event.which) {
        case 1: // left mouse button
            gameClient.game.selectedTile(tile);
            $('#move-options').hide();
            break;
        case 2: // middle mouse button
            break;
        case 3: // right mouse button
            if (gameClient.game.selectedTile().isAdjacentTo(tile) &&
                gameClient.player === gameClient.game.selectedTile().player()) { // if player controls the selected tile
                    
                $('#move-options').html(Rapascia.renderers.moveOptionsRenderer.call(gameClient.game.selectedTile()));
                $this.tooltip({ // jquery's tooltip library
		            tip: '#move-options',
                    
                    events: {
                        def:     "mouseover,",
                        input:   "mouseover,",
                        widget:  "mouseover,",
                        tooltip: "mouseover,"
                    },

		            // custom positioning
                    position: 'center center',

                    // move tooltip a little bit to the right
                    //offset: [0, 15],

                    // there is no delay when the mouse is moved away from the trigger
                    delay: 0
                }).data('tooltip').show();
            }
            break;
        }
        return false;
    });
    
    $('#move-options .units .unit').live('mouseover', function(event) {
        $this = $(this);
        $this.nextAll().removeClass('selected');
        var numUnits = $this.prevAll().andSelf().addClass('selected').length;
        $this.parents('#move-options').find('.num-units').text(numUnits);
    });
    $('#move-options .move-all-units-btn').live('mouseover', function(event) {
        $this = $(this);
        var numUnits = $this.parents('#move-options').find('.unit').addClass('selected').length;
        $this.parents('#move-options').find('.num-units').text(numUnits);
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
    
    // update game state
    
    // render
    $('.game').html(Rapascia.renderers.gameRenderer.call(this.game));
    
    this.time = time;
};

GameClient.prototype.sendCommand = function(command) {
    this.socket.emit('player-command', command);
};

})(window);
