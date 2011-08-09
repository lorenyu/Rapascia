(function(Rapascia, undefined ) {
    
var util = Rapascia.util;

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

Rapascia.renderers.playerRenderer = jade.compile('li.player(name=this.name(), player=this.color(), me=this.isMe())= this.name()');

/**************
 * GameClient *
 **************/
var GameClient = Rapascia.GameClient = function(socket) {
    
    this.player = null;
    this.game = new Rapascia.models.Game();
    this.socket = socket;
    
    socket.once('game-start', _.bind(this.onGameStart, this));
    socket.on('tick', _.bind(this.tick, this));
    socket.on('player-joined', _.bind(function(playerData) {
        
        var player = new Rapascia.models.Player(playerData.name, playerData.isMe);
        
        $('.players').append(Rapascia.renderers.playerRenderer.call(player)); // temporary for debugging
        
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
GameClient.prototype.onGameStart = function(data) {
    this.time = data.time;
    
    this.game.map().load(this.game.players());
};
GameClient.prototype.tick = function(data) {
    $('.time').text(data.time); // for debugging
    
    var commands = data.commands,
        time = data.time,
        timeElapsed,
        energyPerMillisecond = 0.9 / 1000,
        energyGained;
    

    timeElapsed = time - this.time;
    energyGained = timeElapsed * energyPerMillisecond;
    
    _.each(this.game.players(), function(player) {
        player.energy(player.energy() + energyGained);
    });
    
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

var Unit;
Rapascia.require('Rapascia.models.Unit', function(cls) { Unit = cls; });

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
    
    var player = this.from.player();
    if (player.energy() < 3) {
        return;
    }
    player.energy(player.energy() - 3);
    
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

var Tile;
Rapascia.require('Rapascia.models.Tile', function(cls) { Tile = cls; });

/**
 * ProduceCommand
 */
var ProduceCommand = Rapascia.commands.Produce = function(tile) {
    this.name = 'produce';
    this.tile = tile;
};
ProduceCommand.prototype.execute = function() {
    
    var player = this.tile.player();
    if (player.energy() < 3) {
        return;
    }
    player.energy(player.energy() - 3);

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

var Tile;
Rapascia.require('Rapascia.models.Tile', function(cls) { Tile = cls; });

/**
 * DefendCommand
 */
var DefendCommand = Rapascia.commands.Defend = function(tile) {
    this.name = 'defend';
    this.tile = tile;
};
DefendCommand.prototype.execute = function() {
    
    var player = this.tile.player();
    if (player.energy() < 3) {
        return;
    }
    player.energy(player.energy() - 3);

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

})(Rapascia);
