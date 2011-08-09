(function(Rapascia, undefined ) {
    
var util = Rapascia.util,
    Unit;

Rapascia.require('Rapascia.models.Unit', function(cls) { Unit = cls; });

/**
 * Tile Model
 */
var Tile = Rapascia.define('Rapascia.models.Tile', function(map, id) {
    this._time = 0;
    this._map = map;
    this._id = id;
    this._units = [];
    this._mode = 'stopped';
    Tile._tilesById[id] = this;
    
    this._productionAmount = 0;
    
    // UI properties
    this._selected = false;
});
Tile._tilesById = {};
Tile.get = function(id) {
    return Tile._tilesById[id];
};
Tile.PRODUCTION_PER_TILE = 20;
Tile.prototype.tick = function(time) {
    var timeElapsed = time - this._time,
        productionPerSecond,
        numUnitsProduced,
        numUnits = this.units().length,
        player = this.player();
    if (this.mode() == 'producing') {
        if (numUnits <= 5) {
            productionPerSecond = Tile.PRODUCTION_PER_TILE + numUnits * Unit.PRODUCTION_PER_UNIT;
        } else if (numUnits <= 10) {
            productionPerSecond = Tile.PRODUCTION_PER_TILE + (5 + 0.8 * (numUnits - 5)) * Unit.PRODUCTION_PER_UNIT;
        } else if (numUnits <= 15) {
            productionPerSecond = Tile.PRODUCTION_PER_TILE + (9 + 0.6 * (numUnits - 10)) * Unit.PRODUCTION_PER_UNIT;
        } else if (numUnits <= 20) {
            productionPerSecond = Tile.PRODUCTION_PER_TILE + (12 + 0.4 * (numUnits - 15)) * Unit.PRODUCTION_PER_UNIT;
        } else if (numUnits <= 25) {
            productionPerSecond = Tile.PRODUCTION_PER_TILE + (14 + 0.2 * (numUnits - 20)) * Unit.PRODUCTION_PER_UNIT;
        } else {
            productionPerSecond = Tile.PRODUCTION_PER_TILE + 15 * Unit.PRODUCTION_PER_UNIT;
        }
        
        this._productionAmount += (timeElapsed / 1000) * productionPerSecond;
        
        numUnitsProduced = Math.floor(this._productionAmount / Unit.COST_PER_UNIT);
        this._productionAmount = this._productionAmount % Unit.COST_PER_UNIT;
        
        this.addUnits(_.map(_.range(numUnitsProduced), function() {
            var unit = new Rapascia.models.Unit(player);
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
    if (units.length === 0) {
        this.mode('stopped');
    }
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

})(Rapascia);
