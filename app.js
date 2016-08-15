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

	if (data.object == 'page') {
		data.entry.forEach(function(pageEntry) {
		  	var pageID = pageEntry.id;
		  	var timeOfEvent = pageEntry.time;

		  	pageEntry.messaging.forEach(function(messagingEvent) {
		  		receivedMessage(messagingEvent);
		    	// if (messagingEvent.optin) {
		     //  		fb.receivedAuthentication(messagingEvent);
		    	// } else if (messagingEvent.message) {
		     //  		fb.receivedMessage(messagingEvent);
		    	// } else if (messagingEvent.delivery) {
		     //  		fb.receivedDeliveryConfirmation(messagingEvent);
		    	// } else if (messagingEvent.postback) {
		     //  		fb.receivedPostback(messagingEvent);
		    	// } else if (messagingEvent.read) {
		     //  		fb.receivedMessageRead(messagingEvent);
		    	// } else if (messagingEvent.account_linking) {
		     //  		fb.receivedAccountLink(messagingEvent);
		    	// } else {
		     //  		console.log("Webhook received unknown messagingEvent: ", messagingEvent);
		    	// }
		  	});
		});
		res.sendStatus(200);
	}
});

// Interaction with Facebook Messenger API

var receivedMessage = function(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	console.log("Received message for user %d and page %d at %d with message:", 
	senderID, recipientID, timeOfMessage);
	console.log(JSON.stringify(message));

	var isEcho = message.is_echo;
	var messageId = message.mid;
	var appId = message.app_id;
	var metadata = message.metadata;

	// You may get a text or attachment but not both
	var messageText = message.text;
	var messageAttachments = message.attachments;
	var quickReply = message.quick_reply;

	if (isEcho) {
		// Just logging message echoes to console
		console.log("Received echo for message %s and app %d with metadata %s", 
		  messageId, appId, metadata);
		return;
	} else if (quickReply) {
		var quickReplyPayload = quickReply.payload;
		console.log("Quick reply for message %s with payload %s",
		  messageId, quickReplyPayload);

		sendTextMessage(senderID, "Quick reply tapped");
		return;
	}
	if (messageText) {
		// TODO: connect to Wit.ai bot
		sendTextMessage(senderID, messageText);
	}
}

function sendTextMessage(recipientId, messageText) {
	var witUrl = 'https://api.wit.ai/message?q=' + encodeURIComponent(messageText);
	var options = {
		url: witUrl,
		headers: {
			Authorization: 'Bearer ' + config.WIT_TOKEN  
		}
	};
	request.get(options, function(error, response, body) {
		var resultText = '';
		var intent = '';
		var stocks = [];
		if (response.statusCode == 200 && !error) {
			var jsonBody = JSON.parse(response.body);
			if (jsonBody.entities.intent == undefined) {
				resultText = 'Xin lỗi, tôi chưa hiểu yêu cầu của quý khách.'
			} else {
				intent = jsonBody.entities.intent[0].value;
				stocks = jsonBody.entities.symbol;
				resultText = 'Quý khách muốn ' + intent + ' của ';
				if (stocks.length > 0) {	
					for (var index in stocks) {
						var symbol = stocks[index].value;
						resultText += symbol;
						resultText += ' ';
					}
				} else {
					resultText = 'Không tìm thấy mã.';
				}
			}
		} else {
			resultText = 'Xin lỗi, tôi chưa hiểu yêu cầu của quý khách.';
		}
		var messageData = prepareMessageData(recipientId, resultText);
		callSendAPI(messageData);
		switch(intent) {
			case 'stockInfo':
				if (stocks.length > 0) {
					var stockSymbolsString = stocks.map(function(element) {
						return element.value;
					}).join();
					var priceServiceUri = 'https://priceservice.vndirect.com.vn/priceservice/secinfo/snapshot/q=codes:';
					var combinedUri = priceServiceUri + stockSymbolsString;
					var options = {
						method: 'GET',
						uri: combinedUri
					}
					rp(options)
						.then(function(body) {
							console.log('body ' + body);
							return JSON.parse(body);
						})
						.then(function(data) {
							console.log('data ' + data);
							var stockInfoMessage = '';
							for (var index in data) {
								var arrData = data[index].toString().split('|');
								if (arrData.length > 0) {
									stockInfoMessage += prepareStockInfoMessageData(arrData);
								}
							}
							var stockInfoMessageData = prepareMessageData(recipientId, stockInfoMessage);
							callSendAPI(stockInfoMessageData);
						});
					console.log('done')
				}
				break;
			default:
				break;
		}
	});
}

function prepareStockInfoMessageData(data) {
	var resultText = '';
	var stockInfo = {
		code: data[3],
		ceilingPrice: data[15],
		floorPrice: data[16],
		matchQtty: data[20]
	}
	resultText += formatStockInfoData(stockInfo);
	resultText += '\n';
	return resultText;
}
function formatStockInfoData(stockInfo) {
	return stockInfo.code + ': ' + '\n'
		+ 'Sàn: ' + stockInfo.floorPrice + '\n'
		+ 'Trần: ' + stockInfo.ceilingPrice + '\n'
		+ 'KL khớp gần nhất: ' + stockInfo.matchQtty + '\n;'
}

function prepareMessageData(recipientId, text) {
	return {
		recipient: {
			id: recipientId
		},
		message: {
			text: text,
			metadata: "DEVELOPER_DEFINED_METADATA"
		}
	};
}

function callSendAPI(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: config.FB_PAGE_TOKEN },
		method: 'POST',
		json: messageData

		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var recipientId = body.recipient_id;
				var messageId = body.message_id;

				if (messageId) {
					console.log("Successfully sent message with id %s to recipient %s", 
				  	messageId, recipientId);
				} else {
					console.log("Successfully called Send API for recipient %s", 
					recipientId);
				}
			} else {
			  console.error('error' + response.error);
			}
		}
	);  
}

app.listen(PORT, function() {
	console.log('Listening on port ' + PORT);
});