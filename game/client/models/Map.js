(function(Rapascia, undefined ) {
    
var util = Rapascia.util;

/**
 * Map Model
 */
var Map = Rapascia.define('Rapascia.models.Map', function() {
    
    this._time = 0;

});
Map.prototype.load = function(players) {
    
    // hardcode map for now
    var numRows = this.numRows = 8,
        numCols = this.numCols = 8,
        tiles = this._tiles = [], tile,
        i, j,
        player,
        units;
    for (i = 0; i < numRows; i += 1) {
        tiles.push([]);
        for (j = 0; j < numCols; j += 1) {
            tile = new Rapascia.models.Tile(this, numCols*i + j);
            tile.index = numCols*i + numCols;
            tile.i = i;
            tile.j = j;
            tiles[i].push(tile);
            
            switch (i % 4) {
            case 0:
                switch (j % 4) {
                case 0: player = players[0]; break;
                case 1: player = players[2]; break;
                case 2: player = players[3]; break;
                case 3: player = players[1]; break;
                }
                break;
            case 1:
                switch (j % 4) {
                case 0: player = players[2]; break;
                case 1: player = players[2]; break;
                case 2: player = players[3]; break;
                case 3: player = players[3]; break;
                }
                break;
            case 2:
                switch (j % 4) {
                case 0: player = players[1]; break;
                case 1: player = players[1]; break;
                case 2: player = players[0]; break;
                case 3: player = players[0]; break;
                }
                break;
            case 3:
                switch (j % 4) {
                case 0: player = players[3]; break;
                case 1: player = players[1]; break;
                case 2: player = players[0]; break;
                case 3: player = players[2]; break;
                }
                break;
            }
            
            if (player) {
                tile.addUnits(_.map(_.range(3), function() {
                    return new Rapascia.models.Unit(player);
                }));
            }
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

})(Rapascia);
