(function(window, undefined ) {
    
    /**
     * Inherit the prototype methods from one constructor into another.
     *
     * Example:
     *
     *     function foo(){};
     *     foo.prototype.hello = function(){ console.log( this.words )};
     *     
     *     function bar(){
     *       this.words = "Hello world";
     *     };
     *     
     *     io.util.inherit(bar,foo);
     *     var person = new bar();
     *     person.hello();
     *     // => "Hello World"
     *
     * @param {Constructor} ctor The constructor that needs to inherit the methods.
     * @param {Constructor} superCtor The constructor to inherit from.
     * @api public
     */
    var util = {};
    util.inherit = function(ctor, superCtor){
        // no support for `instanceof` for now
        for (var i in superCtor.prototype){
            ctor.prototype[i] = superCtor.prototype[i];
        }
    };
    
    
    /**
     * Underscore plugins
     */
    _.mixin({
        sum: function(list) {
            return _.reduce(list, function(memo, num) {
                return memo + num;
            });
        }
    });
    
    
    
    
    
    $.fn.rapascia = function(method) {
        if (method == 'getModel') {
            var models = this.map(function() {
                var $this = $(this),
                    modelClass = $this.attr('model'),
                    modelid = $this.attr('modelid');
                //console.log(Rapascia.models[modelClass].get(modelid));
                return Rapascia.models[modelClass].get(modelid);
            });
            return models;
        }
        return this;
    };
    
    
    
    
    
    
    
    
    
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
    this._time = 0;
    
    // UI properties
    this._selectedTile = null;
    this._selectingUnits = null;
    this._selectedUnits = null;
};
Game.prototype.tick = function(time) {
    this._time = time;
    this.map().tick(time);
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
            startingPosition = this.map().tiles()[8][8];
            break;
        case 3:
            startingPosition = this.map().tiles()[0][8];
            break;
        case 4:
            startingPosition = this.map().tiles()[8][0];
            break;
    }
    
    // add 4 units for the player
    startingPosition.addUnits(_.map(_.range(4), function() {
        return new Unit(player);
    }));
};
// UI methods
Game.prototype.selectedTile = function() {
    return this.selectedUnits() && this.selectedUnits().length > 0 && this.selectedUnits()[0].tile();
    /*
    if (tile === undefined) {
        return this._selectedTile;
    }
    
    if (this._selectedTile) {
        this._selectedTile.selected(false); // deselect current tile
    }
    if (tile) {
        tile.selected(true); // select next tile
    }
    this._selectedTile = tile;
    */
};
Game.prototype.selectingUnits = function(units) {
    if (units === undefined) {
        return this._selectingUnits;
    }
    
    _.each(this._selectingUnits || [], function(unit) {
        unit.selecting(false);
    });
    _.each(units || [], function(unit) {
        unit.selecting(true);
    });
    this._selectingUnits = units;
};
Game.prototype.selectedUnits = function(units) {
    if (units === undefined) {
        return this._selectedUnits;
    }
    
    _.each(this._selectedUnits || [], function(unit) {
        unit.selected(false);
    });
    _.each(units || [], function(unit) {
        unit.selected(true);
    });
    this._selectedUnits = units;
};

/**
 * Map Model
 */
var Map = Rapascia.models.Map = function() {
    
    this._time = 0;

    // hardcode map for now
    var numRows = this.numRows = 9,
        numCols = this.numCols = 9,
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
Map.prototype.tick = function(time) {
    this._time = time;
    _.each(this.tiles(), function(row) {
        _.invoke(row, 'tick', time);
    });
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
    this._time = 0;
    this._map = map;
    this._id = id;
    this._units = [];
    this._mode = 'stopped';
    Tile._tilesById[id] = this;
    
    this._productionAmount = 0;
    
    // UI properties
    this._selected = false;
};
Tile._tilesById = {};
Tile.get = function(id) {
    return Tile._tilesById[id];
};
Tile.prototype.tick = function(time) {
    var timeElapsed = time - this._time,
        numUnitsProduced,
        player = this.player();
    if (this.mode() == 'producing') {
        this._productionAmount += (timeElapsed / 1000) * this.units().length * Unit.PRODUCTION_PER_UNIT;
        
        numUnitsProduced = Math.floor(this._productionAmount / Unit.COST_PER_UNIT);
        this._productionAmount = this._productionAmount % Unit.COST_PER_UNIT;
        
        this.addUnits(_.map(_.range(numUnitsProduced), function() {
            var unit = new Unit(player);
            unit.mode('producing');
            return unit;
        }));
        
    }
    this._time = time;
    
    _.invoke(this.units(), 'tick', time);
};
Tile.prototype.map = function() {
    return this._map;
};
Tile.prototype.id = function() {
    return this._id;
};
Tile.prototype.units = function(units) {
    if (units === undefined) {
        return this._units;
    }
    _.each(_.difference(this._units, units), function(unit) {
        unit.tile(null);
    });
    _.each(_.difference(units, this._units), function(unit) {
        unit.tile(this);
    }, this);
    this._units = units;
};
Tile.prototype.addUnits = function(units) {
    this.units(_.union(this.units(), units));
};
Tile.prototype.removeUnits = function(units) {
    this.units(_.difference(this.units(), units));
};
Tile.prototype.mode = function(mode) {
    if (mode === undefined) {
        return this._mode;
    }
    this._mode = mode;
    _.invoke(this.units(), 'mode', mode);
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
Tile.prototype.selected = function() {
    return this.units().length > 0 && this.units()[0].selected();
    /*
    if (selected === undefined) {
        return this._selected;
    }
    this._selected = selected;
    */
};
Tile.prototype.toggleSelected = function() {
    this._selected = !this._selected;
};

/**
 * Unit Model
 */
var Unit = Rapascia.models.Unit = function(player) {
    this._id = Unit._nextId;
    Unit._nextId += 1;
    this._time = 0;
    this._player = player;
    this._mode = 'stopped';
    this._health = Unit.HEALTH_PER_UNIT;
    this._cooldown = 0;
    this._tile = null;
    
    Unit._unitsById[this._id] = this;
    
    // UI properties
    this._selecting = false;
    this._selected = false;
};
Unit._nextId = 1;
Unit._unitsById = {};
Unit.HEALTH_PER_UNIT = 10;
Unit.PRODUCTION_PER_UNIT = 4;
Unit.COST_PER_UNIT = 100;
Unit.get = function(id) {
    return Unit._unitsById[id];
};
Unit.prototype.tick = function(time) {
    this._time = time;
};
Unit.prototype.id = function() {
    return this._id;
};
Unit.prototype.player = function() {
    return this._player;
};
Unit.prototype.damage = function() {
    var defaultDamage = 4;
    
    switch (this.mode()) {
    case 'defending': return 1.30 * defaultDamage;
    case 'producing': return 0.35 * defaultDamage;
    }
    return defaultDamage;
};
Unit.prototype.health = function(health) {
    if (health === undefined) {
        return this._health;
    }
    this._health = health;
};
Unit.prototype.tile = function(tile) {
    if (tile === undefined) {
        return this._tile;
    }
    this._tile = tile;
};
Unit.prototype.mode = function(mode) {
    if (mode === undefined) {
        return this._mode;
    }
    this._mode = mode;
};
Unit.prototype.isTransitioning = function() {
    return this._cooldown > 0;
};
Unit.prototype.selecting = function(selecting) {
    if (selecting === undefined) {
        return this._selecting;
    }
    this._selecting = selecting;
};
Unit.prototype.toggleSelecting = function() {
    this._selecting = !this._selecting;
};
Unit.prototype.selected = function(selected) {
    if (selected === undefined) {
        return this._selected;
    }
    this._selected = selected;
};
Unit.prototype.toggleSelected = function() {
    this._selected = !this._selected;
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
    
    socket.on('tick', _.bind(this.tick, this));
    socket.on('player-joined', _.bind(function(playerData) {
        $('.players').append(Rapascia.renderers.playerRenderer.call(playerData)); // temporary for debugging
        
        var player = new Player(playerData);
        this.game.addPlayer(player);
        if (playerData.isMe) {
            this.player = player;
        }
        
    }, this));
    socket.on('player-left', _.bind(function(player) {
        $('li.player[name=' + player.name + ']').remove(); // temporary
    }, this));
    
    // NOTE: we're using mousedown instead of click since the game sometimes
    // re-renders in the middle of a click (between the mousedown and mouseup)
    // so the click never fires
    $(document).bind('contextmenu', function() { return false; });
    $('.tile').live('mousedown', this, function(event) {
        var $this = $(this),
            gameClient = event.data,
            tile = $this.rapascia('getModel')[0];
        
        switch (event.which) {
        case 1: // left mouse button
            gameClient.game.selectedUnits(tile.units());
            //gameClient.game.selectedTile(tile);
            break;
        case 2: // middle mouse button
            break;
        case 3: // right mouse button
            if (gameClient.game.selectedTile().isAdjacentTo(tile) &&
                gameClient.player === gameClient.game.selectedTile().player()) { // if player controls the selected tile
                
                // move units
                //console.log('Moving units ' + gameClient.game.selectedUnits() + ' to tile ' + tile.id());
                gameClient.sendCommand(new Rapascia.commands.Move(gameClient.game.selectedUnits(), gameClient.game.selectedTile(), tile));
            }
            break;
        }
        return false;
    });
    
    $('.tile .units .unit').live({
        'mouseover': function(event) {
            $this = $(this);
            var units = $this.prevAll().andSelf().rapascia('getModel');
            gameClient.game.selectingUnits(units);
        },
        'mouseout': function(event) {
            gameClient.game.selectingUnits([]);
        },
        'mousedown': function(event) {
            $this = $(this);
            var units = $this.prevAll().andSelf().rapascia('getModel');
            //console.log(units);
            gameClient.game.selectedUnits(units);
            return false;
        }
    });
    
    $('.tile .actions .produce').live({
        'mousedown': function(event) {
            var $this = $(this),
                tile = $this.parents('.tile').rapascia('getModel')[0];
            gameClient.sendCommand(new Rapascia.commands.Produce(tile));
        }
    });
    
    $('.tile .actions .defend').live({
        'mousedown': function(event) {
            var $this = $(this),
                tile = $this.parents('.tile').rapascia('getModel')[0];
            gameClient.sendCommand(new Rapascia.commands.Defend(tile));
        }
    });
    
    /*
    $('.tile .move-all-units-btn').live('mouseover', function(event) {
        $this = $(this);
        var numUnits = $this.parents('.tile').find('.unit').addClass('selecting').length;
        $this.parents('.tile').find('.num-units').text(numUnits);
    });
    */
    
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
    this.game.tick(time);
    
    // render
    $('.game').html(Rapascia.renderers.gameRenderer.call(this.game));
    
    this.time = time;
};
GameClient.prototype.execute = function(command) {
    //console.log(command);
    switch (command.name) {
    case 'start-game':
        break;
    case 'move': MoveCommand.deserialize(command).execute();
        break;
    case 'produce': ProduceCommand.deserialize(command).execute();
        break;
    case 'defend': DefendCommand.deserialize(command).execute();
        break;
    }
};
GameClient.prototype.sendCommand = function(command) {
    this.socket.emit('player-command', command.serialize());
};

/***********************
 * Command Definitions *
 ***********************/
 
Rapascia.commands = {};

/**
 * MoveCommand
 */
var MoveCommand = Rapascia.commands.Move = function(units, from, to) {
    //console.log(units);
    this.name = 'move';
    this.units = units;
    this.from = from;
    this.to = to;
};
MoveCommand.prototype.execute = function() {
    
    this.from.removeUnits(this.units);
    
    if (this.from.player() !== this.to.player()) {
        
        // attack
        
        var attackingUnits = this.units,
            defendingUnits = this.to.units(),
            attackingDamage,
            defendingDamage,
            damage,
            attacker,
            defender;
        
        while (attackingUnits.length > 0 && defendingUnits.length > 0) {
            
            attackingDamage = _.sum(_.invoke(attackingUnits, 'damage'));
            defendingDamage = _.sum(_.invoke(defendingUnits, 'damage'));
            
            while (attackingDamage > 0 && defendingUnits.length > 0) {
                
                defender = defendingUnits[0];
                damage = Math.min(attackingDamage, defender.health());
                
                attackingDamage -= damage;
                defender.health( defender.health() - damage );
                
                if (defender.health() <= 0) {
                    defendingUnits.shift();
                }
            }
            
            while (defendingDamage > 0 && attackingUnits.length > 0) {
                
                attacker = attackingUnits[0];
                damage = Math.min(defendingDamage, attacker.health());
                
                defendingDamage -= damage;
                attacker.health( attacker.health() - damage );
                
                if (attacker.health() <= 0) {
                    attackingUnits.shift();
                }
            }
            
        }
        
        // advance remaining units
        if (defendingUnits.length === 0) {
            this.to.addUnits(attackingUnits);
        }
        
        // reset health
        _.invoke(this.to.units(), 'health', Unit.HEALTH_PER_UNIT);
        _.invoke(this.from.units(), 'health', Unit.HEALTH_PER_UNIT);
        
    } else {
        this.to.addUnits(this.units);
    }
};
MoveCommand.prototype.serialize = function() {
    return {
        name: this.name,
        units: _.map(this.units, function(unit) {
            return unit.id();
        }),
        from: this.from.id(),
        to: this.to.id()
    };
};
MoveCommand.deserialize = function(command) {
    var units = _.map(command.units, function(unitid) {
            return Unit.get(unitid);
        }),
        from = Tile.get(command.from),
        to = Tile.get(command.to);
    
    return new MoveCommand(units, from, to);
};

/**
 * ProduceCommand
 */
var ProduceCommand = Rapascia.commands.Produce = function(tile) {
    this.name = 'produce';
    this.tile = tile;
};
ProduceCommand.prototype.execute = function() {

    this.tile.mode('producing');

};
ProduceCommand.prototype.serialize = function() {
    return {
        name: this.name,
        tile: this.tile.id()
    };
};
ProduceCommand.deserialize = function(command) {
    var tile = Tile.get(command.tile);
    
    return new ProduceCommand(tile);
};

/**
 * DefendCommand
 */
var DefendCommand = Rapascia.commands.Defend = function(tile) {
    this.name = 'defend';
    this.tile = tile;
};
DefendCommand.prototype.execute = function() {

    this.tile.mode('defending');

};
DefendCommand.prototype.serialize = function() {
    return {
        name: this.name,
        tile: this.tile.id()
    };
};
DefendCommand.deserialize = function(command) {
    var tile = Tile.get(command.tile);
    
    return new DefendCommand(tile);
};

})(window);
