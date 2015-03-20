var async = require('async')
  , moment = require('moment')
  // , User = require(process.cwd() + "/api/models/User")
  // , Game = require(process.cwd() + "/api/models/Game")
  , sails = require('sails')
  ;


var env = process.env.NODE_ENV || 'development';

module.exports = function(grunt) {

	grunt.registerTask('seed', function(){
		if ( env != 'development' ) {
			grunt.warn("`grunt seed` is intended to be used only in a development environment.\n");
			return false;
		}

		var done = this.async();
		var tasks = [function(cb){ cb(); }];


		sails.lift(function(){
			tasks.push(function(cb){ 
				User.native(function(err, collection){
					collection.drop(cb);
				}) 
			})

			tasks.push(function(cb){ 
				Game.native(function(err, collection){
					collection.drop(cb);
				}) 
			})

			users.forEach(function(user){
				tasks.push(function(cb){
					User.create(user, cb);
				})
			})

			games.forEach(function(game){
				tasks.push(function(cb){
					Game.create(game, cb);
				})
			})

			tasks.push(function(cb){
				User.findOne({email:'benjamin.m.wilhelm@gmail.com'}, function(err, user){
					Game.update({}, {organizer: user.id}, cb);
				})
			})

			tasks.push(function(cb){
				Game.native(function(err, collection){
					collection.update({gameTime: {'$gt': moment().add({days:7}).toDate()}},{
						'$set': {
							gameTime: moment().subtract({days: 4}).toDate(),
							pollingCutoff: moment().subtract({days:4, hours:12}).toDate()
						}
					}, cb)
				});
			})

			tasks.push(function(cb){
				User.update({}, {verified: true, verificationCode: null}, cb)
			})


			async.series(tasks, function(err, rslt){
				if (err) {
					grunt.log.error(err);
					return;
				}

				grunt.log.ok("Seeded.\n");
				done();
			});
		})
	})

}


var users = [
	{
		firstName : 'Ben',
		lastName  : 'Wilhelm',
		email     : 'benjamin.m.wilhelm@gmail.com',
		role      : 'organizer',
		password  : 'password'
	},
	{
		firstName : 'Another',
		lastName  : 'User',
		email     : 'anotheruser@test.com',
		password  : 'password'
	},
	{
		firstName : 'Player',
		lastName  : 'One',
		email     : 'playerone@test.com',
		password  : 'password'
	},
	{
		firstName : 'Someone',
		lastName  : 'Two',
		email     : 'two@test.com',
		password  : 'password'
	},
	{
		firstName : 'Player',
		lastName  : 'Three',
		email     : 'three@test.com',
		password  : 'password'
	},
	{
		firstName : 'Four',
		lastName  : 'User',
		email     : 'four@test.com',
		password  : 'password'
	},
	{
		firstName : 'Fifth',
		lastName  : "O'Player",
		email     : 'five@test.com',
		password  : 'password'
	},
	{
		firstName : 'Number',
		lastName  : 'Six',
		email     : 'six@test.com',
		password  : 'password'
	}
]


var games = [
	{
	    organizer: 1,
	    gameTime: moment().add({days: 3}).toDate(),
	    pollingCutoff: moment().add({days:2, hours:12}).toDate(),
	    locationName: "River Park",
	    address: "Foster and Francisco, Chicago",
	    minimumPlayers: 6,
	    comment: "Who wants to play?"
	},
	{
	    organizer: 1,
	    gameTime: moment().add({days: 10}).toDate(),
	    pollingCutoff: moment().add({days:9, hours:12}).toDate(),
	    locationName: "River Park",
	    address: "Foster and Francisco, Chicago",
	    minimumPlayers: 6,
	    comment: "Who wants to play?"
	}
]