(function(Rapascia, undefined ) {
    
var util = Rapascia.util;

var Timer = Rapascia.define('Rapascia.models.Timer', function(time) {
    this._time = time;
    this._started = null;
    this._stopped = null;
});
Timer.prototype.start = function() {
    this._started = this.time().millis();
    this._stopped = null;
};
Timer.prototype.stop = function() {
    if (this._stopped) {
        return;
    }
    this._stopped = this.time().millis();
};
Timer.prototype.time = function() {
    return this._time;
};
Timer.prototype.timeElapsed = function() {
    if (this._started) {
        if (this._stopped) {
            return this._stopped - this.started();
        } else {
            return this.time().millis() - this.started();
        }
    }
    return 0;
};
Timer.prototype.started = function() {
    return this._started;
};


})(Rapascia);
