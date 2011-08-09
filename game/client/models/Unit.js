(function(Rapascia, undefined ) {
    
var util = Rapascia.util;

/**
 * Unit Model
 */
var Unit = Rapascia.define('Rapascia.models.Unit', function(player) {
    this._id = Unit._nextId;
    Unit._nextId += 1;
    this._time = 0;
    this._player = player;
    this._health = Unit.HEALTH_PER_UNIT;
    this._cooldown = 0;
    this._tile = null;
    
    Unit._unitsById[this._id] = this;
    
    // UI properties
    this._selecting = false;
    this._selected = false;
});
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
    case 'defending': return 1.50 * defaultDamage;
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
Unit.prototype.mode = function() {
    if (this.tile()) {
        return this.tile().mode();
    }
    return 'moving';
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

})(Rapascia);