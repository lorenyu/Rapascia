(function(Rapascia, undefined ) {
    
var util = Rapascia.util;

var Tile;
Rapascia.require('Rapascia.models.Tile', function(cls) { Tile = cls; });

/**
 * DefendCommand
 */
var DefendCommand = Rapascia.define('Rapascia.commands.Defend', function(tile) {
    this.name = 'defend';
    this.tile = tile;
});
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
