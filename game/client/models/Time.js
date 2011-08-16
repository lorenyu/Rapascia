(function(Rapascia, undefined ) {
    
var util = Rapascia.util;

var Time = Rapascia.define('Rapascia.models.Time', function() {
    this._prevMillis = null;
    this._millis = null;
});
/**
 * Returns the time in milliseconds
 */
Time.prototype.millis = function(millis) {
    if (millis === undefined) {
        return this._millis;
    }
    this._prevMillis = this._millis;
    this._millis = millis;
    return this;
};
Time.prototype.prevMillis = function() {
    return this._prevMillis;
};
Time.prototype.timeElapsed = function() {
    if (this.millis() && this.prevMillis()) {
        return this.millis() - this.prevMillis();
    }
    return 0;
};


})(Rapascia);
