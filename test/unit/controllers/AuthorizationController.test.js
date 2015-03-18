var app
  , Barrels = require('barrels')
  , barrels = new Barrels(process.cwd() + '/test/fixtures')
  , request = require('supertest')
  , should = require('should')
  ;

describe("AuthorizationController", function(){

  beforeEach(function(done){
    app = sails.hooks.http.app;
    barrels.populate(done, false)
  })

  describe("#login action", function(){
    it("should set cookie, return 200 and user on successful login", function(done){
      request(app)
      .post("/login")
      .send({email:'admin@test.com', password:'admin_password'})
      .expect(200)
      .expect('Content-Type', /json/)
      .expect("set-cookie", /user/)
      .end(function(err, res) {
        if (err) throw err;
        res.body.user.email.should.eql('admin@test.com');
        should(res.body.user.password).eql(undefined);
        done();
      })
    });

    it("should send 403 for bad email", function(done){
      request(app)
      .post('/login')
      .send({email:'admin@toast.com', password:'admin_password'})
      .expect(403)
      .end(function(err, res){
        if (err) throw err;
        should(res.body).eql({});
        done();
      })
    })


    it("should send 403 for bad password", function(done){
      request(app)
      .post('/login')
      .send({email:'admin@test.com', password:'wrong_password'})
      .expect(403)
      .end(function(err, res){
        if (err) throw err;
        should(res.body).eql({});
        done();
      })
    })

    it("should return descriptive error message on failed login");
  });

  describe("#logout action", function(){
    it("should respond with loggedOut:true", function(done){
      request(app)
      .get('/logout')
      .expect(200)
      .end(function(err, res){
        res.body.loggedOut.should.eql(true);
        done();
      })
    })
  })

})
