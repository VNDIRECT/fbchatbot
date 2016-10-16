// Interaction with Facebook Messenger API

const request = require('request');
const config = require('./config');
const sessions = config.sessions;
const rp = require('request-promise');

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
				console.log(error);
				console.log(response);
				console.log(body);
			}
		}
	);
}

const pretendTyping = (sender) => {
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: config.FB_PAGE_TOKEN },
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

// get user's name, gender...
const findOrCreateUserSessionInfo = (fbid) => {
	return new Promise(function(resolve, reject) {
		let sessionId;

		// let's see if we already have a session for the user fbid
		Object.keys(sessions).forEach(k => {
			if (sessions[k].fbid === fbid) {
				sessionId = k;
				resolve(sessions[sessionId]);
			}
		});

		if (!sessionId) { // no session found for user fbid, let's create a new one
			rp({
				method: 'GET',
				url: 'https://graph.facebook.com/v2.6/' + fbid,
				qs: {
					access_token: config.FB_PAGE_TOKEN,
					fields: 'first_name,last_name,profile_pic,locale,timezone,gender'
				}
			}).then(function(data) {
				sessionId = new Date().toISOString();
				data = JSON.parse(data);
				let userData = {fbid: fbid, context: {}, fbProfile: data};
				if (userData.fbProfile.gender == 'male') {
					userData.pronounce = 'anh';
					userData.Pronounce = 'Anh';
				} else if (userData.fbProfile.gender == 'female') {
					userData.pronounce = 'chị';
					userData.Pronounce = 'Chị';
				} else {
					userData.pronounce = 'bạn';
					userData.Pronounce = 'Bạn';
				}
				sessions[sessionId] = userData;
				resolve(sessions[sessionId]);
			}).catch(function(data) {
				reject(data);
			});
		}
	});
}

module.exports = {
	processRequest: processRequest,
	sendTextMessage: sendTextMessage,
	sendButtonMessage: sendButtonMessage,
	pretendTyping: pretendTyping,
	findOrCreateUserSessionInfo: findOrCreateUserSessionInfo
}
