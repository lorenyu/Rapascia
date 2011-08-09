(function(Rapascia, undefined ) {
    
var util = Rapascia.util;

var Tile;
Rapascia.require('Rapascia.models.Tile', function(cls) { Tile = cls; });

/**
 * ProduceCommand
 */
var ProduceCommand = Rapascia.define('Rapascia.commands.Produce', function(tile) {
    this.name = 'produce';
    this.tile = tile;
});
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

})(Rapascia);
