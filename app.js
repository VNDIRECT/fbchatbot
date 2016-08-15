'use strict';

// Require dependencies
const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const rp = require('request-promise');

// Load our code
const fb = require('./facebook');
const bot = require('./bot');
const tradeApi = require('./vnds-trade-api');
const priceApi = require('./vnds-priceservice-api');
const utils = require('./utils');
const config = require('./config');
const sessions = config.sessions;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setup bot
// const wit = bot.getWit();

// Webserver parameter
const PORT = process.env.PORT || 8445;

app.get('/webhook', function(req, res) {
 	if (req.query['hub.mode'] === 'subscribe' &&
    	req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
    	console.log("Validating webhook");
    	res.status(200).send(req.query['hub.challenge']);
  	} else {
    	console.error("Failed validation. Make sure the validation tokens match.");
    	res.sendStatus(403);          
  	}
});

app.post('/webhook', function (req, res) {
	var data = req.body;

	fb.processRequest(req, function(message, senderId) {
		bot.witProcessor(message, senderId).then(function(entities) {
			var resultText = '';
			var intent = entities.intent[0];
			if (intent == undefined) {
				resultText = 'Xin lỗi, tôi chưa hiểu yêu cầu của quý khách.';
			} else {
				switch(intent.value) {
					case 'stockInfo':
						if (entities.symbol) {
							resultText = bot.stockInfoProcessor(entities.symbol)
						} else {
							resultText = 'Xin lỗi, tôi không tìm thấy mã chứng khoán này.'
						}
						break;
					case 'sayHi':
						resultText = 'Chào bạn. ;)'
						break;
					default:
						resultText = 'Xin lỗi, tôi hiểu yêu cầu của bạn, nhưng tôi không biết phải làm gì.';
				}
			}
			return resultText;
		})
		.then(function(resultText) {
			fb.sendTextMessage(senderId, resultText);
		});
		res.sendStatus(200);
	});
});

app.listen(PORT, function() {
	console.log('Listening on port ' + PORT);
});