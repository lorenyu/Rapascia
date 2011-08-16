describe('Rapascia.models.Timer', function(){
    var timer,
        time;
    beforeEach(function() {
        time = new Rapascia.models.Time();
        timer = new Rapascia.models.Timer(time);
        time.millis(1000);
    });
    describe('starting the timer', function() {
        beforeEach(function() {
            timer.start();
            time.millis(2000);
        });
        it('should start', function() {
            expect(timer.timeElapsed()).toBe(1000);
        });
        describe('stopping the timer', function() {
            beforeEach(function() {
                timer.stop();
                time.millis(3000);
            });
            it('should stop', function() {
                expect(timer.timeElapsed()).toBe(1000);
            });
            describe('restarting the timer', function() {
                beforeEach(function() {
                    timer.start();
                    time.millis(4000);
                });
                it('should restart the timer', function() {
                    expect(timer.timeElapsed()).toBe(1000);
                });
            });
            describe('stopping when the timer is already stopped', function() {
                beforeEach(function() {
                    timer.stop();
                    time.millis(4000);
                });
                it('should not affect anything', function() {
                    expect(timer.timeElapsed()).toBe(1000);
                });
            });
        });
    });
});