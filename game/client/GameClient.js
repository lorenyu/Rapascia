(function(Rapascia, undefined ) {
    
var util = Rapascia.util;

/*************
 * Renderers *
 *************/
 
// TODO: move renderers out of this file.
 
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

var MoveCommand,
    DefendCommand,
    ProduceCommand,
    Time;
Rapascia.require('Rapascia.commands.Move', function(Move) { MoveCommand = Move; });
Rapascia.require('Rapascia.commands.Defend', function(Defend) { DefendCommand = Defend; });
Rapascia.require('Rapascia.commands.Produce', function(Produce) { ProduceCommand = Produce; });
Rapascia.require('Rapascia.models.Time', function(cls) { Time = cls; });

/**************
 * GameClient *
 **************/
var GameClient = Rapascia.GameClient = function(socket) {
    
    this.player = null;
    this.time = new Time();
    this.game = new Rapascia.models.Game(this.time);
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
            if (gameClient.game.activePlayer().isMe()) {
                gameClient.game.selectedUnits(units);
            }
            return false;
        }
    });
    
    $('.tile .actions .produce').live({
        'mousedown': function(event) {
            var $this = $(this),
                tile = $this.parents('.tile').rapascia('getModel')[0];
            if (gameClient.game.activePlayer().isMe()) {
                gameClient.sendCommand(new Rapascia.commands.Produce(tile));
            }
        }
    });
    
    $('.tile .actions .defend').live({
        'mousedown': function(event) {
            var $this = $(this),
                tile = $this.parents('.tile').rapascia('getModel')[0];
            if (gameClient.game.activePlayer().isMe()) {
                gameClient.sendCommand(new Rapascia.commands.Defend(tile));
            }
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
    this.time.millis(data.time);
    
    this.game.start();
    this.game.map().load(this.game.players());
};
GameClient.prototype.tick = function(data) {
    $('.time').text(data.time); // for debugging
    
    var commands = data.commands,
        time = data.time,
        timeElapsed;
    
    // process player commands
    _.each(commands, _.bind(this.execute, this));
    
    // update game state
    this.game.tick(time);
    
    // render
    $('.game').html(Rapascia.renderers.gameRenderer.call(this.game));
    
    this.time.millis(time);
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

})(Rapascia);
