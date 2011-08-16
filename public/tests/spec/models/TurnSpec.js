describe('Rapascia.models.Turn', function(){
    var turn,
        time;
    beforeEach(function() {
        time = new Rapascia.models.Time();
        turn = new Rapascia.models.Turn(time);
        time.millis(1000);
    });
    it('should start the turn', function() {
        turn.start();
        time.millis(2000);
        expect(turn.timeLeft()).toBe(turn.turnLength() - 1000);
    });
    it('should fire "turn-ended" event when turn is over.', function() {
        var spy = jasmine.createSpy();
        $(turn).bind('turn-ended', spy);
        
        turn.start();
        time.millis(1000 + turn.turnLength());
        turn.tick();
        expect(turn.timeLeft()).not.toBeGreaterThan(0);
        expect(spy).toHaveBeenCalled();
    });
});