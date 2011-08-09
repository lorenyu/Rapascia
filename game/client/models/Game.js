(function(Rapascia, undefined ) {
    
var util = Rapascia.util;

/**
 * Game Model
 */
var Game = Rapascia.define('Rapascia.models.Game', function() {
    this._players = [];
    this._map = new Rapascia.models.Map();
    this._time = 0;
    
    // UI properties
    this._selectedTile = null;
    this._selectingUnits = null;
    this._selectedUnits = null;
});
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
    
    /*
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
    */
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

})(Rapascia);
