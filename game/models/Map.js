var _ = require('underscore'),
    Tile = require('./Tile.js');

var Map = module.exports = function() {

    // hardcode map for now
    var numRows = 12,
        numCols = 12,
        tiles = [], tile,
        i,
        j;
    for (i = 0; i < numRows; i += 1) {
        tiles.push([]);
        for (j = 0; j < numCols; j += 1) {
            tile = new Tile(numCols*i + numCols);
            tile.index = numCols*i + numCols;
            tile.i = i;
            tile.j = j;
            tiles[i].push(tile);
        }
    }
    /*
    _.each(tiles, function(tile) {
        var i = tile.index;
        var adjacentTileIndices = _.select([i-numCols, i+1, i-1, i+numCols], function(j) {
            return j >= 0 && j < tiles.length;
        });
        tile.adjacentTiles = _.map(adjacentTileIndices, function(j) {
            return tiles[j];
        });
    });
    */

    this.tiles = tiles;
    this.units = [];
};
