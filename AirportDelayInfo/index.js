'use strict';

module.change_code = 1; // Allow this module to be reloaded by hotswap when changed
var _ = require('lodash');
var Alexa = require('alexa-app');
var app = new Alexa.app('helpdesk'); // Define an alexa-app [use the same name as invocation name]
var FAADataHelper = require('./delay_info');
var helpInfo = require('./faq_info');

// Gets called whenever there is a launch request
app.launch(function(req, res) {
  var prompt = 'For delay information, tell me an Airport code. Or You can ask questions such as, where can I book a Taxi? ';
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
      var faaHelper = new FAADataHelper(),
      status;

      faaHelper.requestAirportStatus(airportCode).then(function(airportStatus) {
        status = faaHelper.formatAirportStatus(airportStatus)
        res.say(status).card({
          type:    "Simple",
          title:   "Airport Status Info",  //this is not required for type Simple 
          content: status 
        }).send();
      }).catch(function(err) {
        console.log(err.statusCode);
        var prompt = 'I didn\'t have data for an airport code of ' + airportCode;
        res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
      });
      return false;
    }
  }
  );


// Help Info Intent
app.intent('airportHelpDesk', {
  'slots': {
    'Info': 'LIST_OF_INFO'
  }
}, 
function(req, res){
  // get the slot
  var infoSlot = req.slot('Info').toLowerCase();
  var   information = helpInfo[infoSlot];

   if (information) {
    var reprompt = 'What can I help you with?';
    res.say(information).reprompt(reprompt).card({
      type: "Standard",
      title: "Airport Help Info",
      text: information,
      image: {                //image is optional 
        smallImageUrl: "https://s3.amazonaws.com/qwinix-echo/small.jpg",
        largeImageUrl: "https://s3.amazonaws.com/qwinix-echo/large.jpg"
      } 
    }).shouldEndSession(false);
    return true;
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

app.intent('AMAZON.HelpIntent',
  function (req, res) {
    var help = "For delay information, tell me an Airport code. For example, S F O ..... Or You can ask questions such as, where can I book a Taxi?, or, you can say exit... Now, what can I help you with? ";
    res.say(help).shouldEndSession(false);              // Or let the user stop an action (but remain in the skill)

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