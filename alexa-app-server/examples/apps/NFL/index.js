'use strict';

module.change_code = 1; // Allow this module to be reloaded by hotswap when changed

var options = {
  timeout: 15000, // Service call timeout
  nfl: {
    version: 'nfl/v2',
    key: '72f9e106e27742ac862340b43f38f7de' // <-- Pass in your nfl key here
  }
};

var _ = require('lodash');
var Alexa = require('alexa-app');
var app = new Alexa.app('nflplayers'); // Define an alexa-app [use the same name as invocation name]
var fantasyData = require('fantasydata-api')(options);
var playerId = require('./player_ids');

// Gets called whenever there is a launch request
app.launch(function(req, res) {
  var prompt = 'Welcome to NFL skill.';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

// Player Basic Introduction Intent
app.intent('playerBasicIntro', {
  'slots': {
    'Player': 'LIST_OF_PLAYERS'
  }
}, 
function(req, res){
  // get the slot
  var infoSlot = req.slot('Player').toLowerCase();
  var information = playerId[infoSlot],
  reprompt = 'Tell me a player name';
  var prompt = '';
  
  if (information) {
    fantasyData.nfl.player(information, function(err, results) {  
      console.log(results.PlayerSeason.Team)
      prompt = _.template('${name} was born on ${dob}. He currently plays for ${team} at ${position} position.')({
        name: results.Name,
        dob: results.BirthDateString,
        team: results.CurrentTeam,
        position: results.PositionCategory
      });
      res.say(prompt).reprompt(reprompt).card({
        type: "Standard",
        title: "Player Basic Introduction",
        text: information,
        image: {                //image is optional 
          smallImageUrl: "https://s3.amazonaws.com/qwinix-echo/small.jpg",
          largeImageUrl: "https://s3.amazonaws.com/qwinix-echo/large.jpg"
        } 
      }).shouldEndSession(false).send();
    }); 
    return false;
  } else {
    var speech;
    var reprompt = 'What else can I help you with?' 
    if (infoSlot) {
      speech = "I'm sorry, I currently do not have any Information for " + infoSlot + ". What else can I help you with?";
    } else {
      speech = "I'm sorry, I currently do not have any Information regarding that. What else can I help you with?";
    }
    res.say(speech).reprompt(reprompt).shouldEndSession(false);
  }
});

module.exports = app;