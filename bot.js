// Interaction with Wit.ai

'use strict';

const config = require('./config');
const rp = require('request-promise');

function process(messageText, recipientId) {
	var witUrl = 'https://api.wit.ai/message?q=' + encodeURIComponent(messageText);
	var options = {
		method: 'GET',
		url: witUrl,
		headers: {
			Authorization: 'Bearer ' + config.WIT_TOKEN  
		}
	};
	return rp(options).then(function(response) {
		var jsonBody = JSON.parse(response);
		return jsonBody.entities;
	});
}

module.exports = {
	process: process
}
