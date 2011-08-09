(function(Rapascia, undefined ) {
    
var util = Rapascia.util;

/**
 * Player Model
 */
var Player = Rapascia.define('Rapascia.models.Player', function(name, isMe) {
    this._index = Player.nextIndex();
    this._name = name;
    this._isMe = isMe;
    this._energy = 3;
});
Player.prototype.name = function() {
    return this._name;
};
Player.prototype.isMe = function() {
    return this._isMe;
};
Player.nextIndex = (function() {
    var index = 1;
    return function() {
        index += 1;
        return index - 1;
    };
})();
Player.prototype.index = function() {
    return this._index;
};
Player.prototype.color = function() {
    switch (this._index) {
    case 1: return 'red';
    case 2: return 'blue';
    case 3: return 'green';
    case 4: return 'magenta';
    case 5: return 'orange';
    case 6: return 'cyan';
    }
    return 'gray';
};
Player.prototype.energy = function(energy) {
    if (energy === undefined) {
        return this._energy;
    }
    this._energy = energy;
};

})(Rapascia);