describe("MailService", function(){

  describe("sendInvite method", function(){
    it("should send invitation to all users passed to method")
    it("should include gametime, location, polling cutoff time, and organizer comment")
    it("should include links for yes/no, with game-and-user-specific hashkey")
  })

  describe("sendReminder method", function(){
    it("should send to all users passed to method")
    it("should include current count of players")
    it("should include template text")
    it('should include rsvp links with game-and-user-specific hashkeys')
  })

  describe("sendGameOn method", function(){
    it("should send to all users passed to method")
    it("should include current count of players")
    it("should include gametime and location")
    it("should include template text")
  })

  describe("sendGameOff method", function(){
    it("should send to all users passed to method")
    it("should include template text")
  })

})