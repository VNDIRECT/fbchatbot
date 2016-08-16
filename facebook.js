// Interaction with Facebook Messenger API'

const request = require('request');
const config = require('./config');

function processRequest(req, callback) {

	const pageId = req.body.entry[0].id;
	const userId = req.body.entry[0].messaging[0].sender.id;

	if (req.body.object == 'page' && pageId != userId) {

		req.body.entry.forEach(function(pageEntry) {

			var pageID = pageEntry.id;
			var timeOfEvent = pageEntry.time;

			pageEntry.messaging.forEach(function(event) {
				var senderID = event.sender.id;
				var recipientID = event.recipient.id;
				var timeOfMessage = event.timestamp;
				var message = event.message;

				if (message && message.text) {
					callback(message.text, senderID);
				} else {
					console.log('Received event', JSON.stringify(event));
				}
			});
		});
	}
}

function sendTextMessage(recipientId, messageText) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText,
			metadata: "DEVELOPER_DEFINED_METADATA"
		}
	};

	callSendAPI(messageData);
}

function sendButtonMessage(recipientId, messageText, buttons) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "template",
				payload: {
					template_type: "button",
					text: messageText,
					buttons: []
				}
			}
		}
	};

	for (let button of buttons) {
		messageData.message.attachment.payload.buttons.push(button);
	}

	callSendAPI(messageData);
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
					console.log("Successfully sent message with id %s to recipient %s", messageId, recipientId);
				} else {
					console.log("Successfully called Send API for recipient %s", recipientId);
				}
			} else {

			}
		}
	);
}

const pretendTyping = (sender) => {
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token: config.FB_PAGE_TOKEN},
		method: 'POST',
		json: {
			recipient: {id: sender},
			sender_action: "typing_on"
		}
		}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error);
		} else if (response.body.error) {
			console.log('Error: ', response.body.error);
		}
	});
};

module.exports = {
	processRequest: processRequest,
	sendTextMessage: sendTextMessage,
	sendButtonMessage: sendButtonMessage,
	pretendTyping: pretendTyping
}