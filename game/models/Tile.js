var Unit = require('./Unit.js');

var Tile = module.exports = function(id, adjacentTiles) {
    this.id = id;
    this.adjacentTiles = adjacentTiles || [];
    this.units = [];
};
