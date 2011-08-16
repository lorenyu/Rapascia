describe('Rapascia.models.Time', function(){
    var time;
    beforeEach(function() {
        time = new Rapascia.models.Time();
        time.millis(1);
    });
    it('should return correct time', function() {
        expect(time.millis()).toBe(1);
    });
    it('should remember previous time', function() {
        time.millis(123);
        expect(time.prevMillis()).toBe(1);
    });
    it('should return the correct amount of time that elapsed since previous time', function() {
        time.millis(11);
        expect(time.timeElapsed()).toBe(10);
    });
});