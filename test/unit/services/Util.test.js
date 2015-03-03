describe("Utils Service", function(){

  describe("isBcrypted method", function(){

    it("should return true for 59-character encrypted string", function(done) {
      var pw = "$2$10$szP.dDL09YCQieDGozr9CevNwFsAhpr6NJuLpz3o2tEZ36S.AVufe";
      Util.isBcrypted(pw).should.eql(true);
      done();
    });

    it("should return true for 60-character encrypted string", function(done) {
      var pw = "$2a$10$szP.dDL09YCQieDGozr9CevNwFsAhpr6NJuLpz3o2tEZ36S.AVufe";
      Util.isBcrypted(pw).should.eql(true);
      done();
    });

    it("should return false for unencrypted string", function(done){
      Util.isBcrypted("unencrypted").should.eql(false);
      done();
    });

  })

})