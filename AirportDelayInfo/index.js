'use strict';

module.change_code = 1; // Allow this module to be reloaded by hotswap when changed
var _ = require('lodash');
var Alexa = require('alexa-app');
var app = new Alexa.app('airportinfo'); // Define an alexa-app
var FAADataHelper = require('./faa_data_helper');

// Gets called whenever there is a launch request
app.launch(function(req, res) {
  var prompt = 'For delay information, tell me an Airport code.';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

// Gets called whenever there is an intent request
app.intent('airportinfo', {
  'slots': {
    'AIRPORTCODE': 'FAACODES'
  },
  'utterances': ['{|flight|airport} {|delay|status} {|info} {|for} {-|AIRPORTCODE}']
},  
function(req, res) {
    //get the slot

    var airportCode = req.slot('AIRPORTCODE');

    var reprompt = 'Tell me an airport code to get delay information.';

    //check if the slot value is empty or not 
    if (_.isEmpty(airportCode)) {

      var prompt = 'I didn\'t hear an airport code. Tell me an airport code.';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      return true;
    } 
    else {
      var faaHelper = new FAADataHelper();

      faaHelper.requestAirportStatus(airportCode).then(function(airportStatus) {
        res.say(faaHelper.formatAirportStatus(airportStatus)).send();
      }).catch(function(err) {
        console.log(err.statusCode);
        var prompt = 'I didn\'t have data for an airport code of ' + airportCode;
        res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
      });
      return false;
    }
  }
  );

app.intent('AMAZON.HelpIntent',
  function (req, res) {
    var help = "For delay information, tell me an Airport code. For example, S F O";
    res.say(help).shouldEndSession(true);              // Or let the user stop an action (but remain in the skill)

  });

app.intent('AMAZON.StopIntent',
  function (req, res) {
    var goodbye = "Thank you for talking with me. Goodbye.";
    res.say(goodbye).shouldEndSession(true);              // Or let the user stop an action (but remain in the skill)

  });

//hack to support custom utterances in utterance expansion string
var utterancesMethod = app.utterances;
app.utterances = function() {
  return utterancesMethod().replace(/\{\-\|/g, '{');
};
module.exports = app;