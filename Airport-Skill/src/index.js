/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 *
 */

'use strict';

var AlexaSkill = require('./AlexaSkill'),
    informations = require('./info');

var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

/**
 * AirportInfoHelper is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var AirportInfoHelper = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
AirportInfoHelper.prototype = Object.create(AlexaSkill.prototype);
AirportInfoHelper.prototype.constructor = AirportInfoHelper;

AirportInfoHelper.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechText = "Welcome to the Airport Info Helper. You can ask a question like, where can I book a Taxi? ... Now, what can I help you with.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, please say help me.";
    response.ask(speechText, repromptText);
};

AirportInfoHelper.prototype.intentHandlers = {
    "AirportInfoIntent": function (intent, session, response) {
        var infoSlot = intent.slots.Info,
            infoName;
        if (infoSlot && infoSlot.value){
            infoName = infoSlot.value.toLowerCase();
        }

        var cardTitle = "Information for " + infoName,
            information = informations[infoName],
            speechOutput,
            repromptOutput;
        if (information) {
            speechOutput = {
                speech: information,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.tellWithCard(speechOutput, cardTitle, information);
        } else {
            var speech;
            if (infoName) {
                speech = "I'm sorry, I currently do not have any Information for " + infoName + ". What else can I help you with?";
            } else {
                speech = "I'm sorry, I currently do not have any Information regarding that. What else can I help you with?";
            }
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            repromptOutput = {
                speech: "What else can I help you with?",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.ask(speechOutput, repromptOutput);
        }
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can ask questions such as, where can I book a Taxi?, or, you can say exit... Now, what can I help you with?";
        var repromptText = "You can say things like, where can I book a Taxi?, or you can say exit... Now, what can I help you with?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
};

exports.handler = function (event, context) {
    var airportInfoHelper = new AirportInfoHelper();
    airportInfoHelper.execute(event, context);
};
