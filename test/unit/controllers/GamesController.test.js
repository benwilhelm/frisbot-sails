describe("GamesController", function(){

  describe("#index action", function(){
    it('should respond with all future games')
  });

  describe("#show action", function(){
    it("should respond with game corresponding to :id param")
  });

  describe("#create action", function(){
    it('should require logged in user with organizer role')
    it("should send rsvp email to all players")
    it("should create new game")
    it("should respond with newly created game")
    it('should respond with useful error messages if invalid')
  });

  describe("#update action", function(){
    it('should require logged in user with organizer role')
    it('should update game in database')
    it("should notify players of gameTime/pollingCutoff changes")
    it('should respond with useful error messages if invalid')
  })

  describe("#rsvp action", function(){
    it("should require logged in user or correct hashkey")
    it("should allow rsvp to logged in user")
    it('should allow rsvp with correct hashkey')
    it("should add user's id to playing array if rsvp is yes")
    it("should add user's id to notPlaying array if rsvp is no")
  })

  describe("#destroy action", function(){
    it('should require logged in user with organizer role')
    it('should delete game from database')
    it('should notify players')
  })

})