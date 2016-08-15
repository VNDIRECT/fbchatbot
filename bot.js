// Interaction with Wit.ai

'use strict';

const config = require('./config');
const rp = require('request-promise');
const priceService = require('./vnds-priceservice-api');

function witProcessor(messageText, recipientId) {
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

function stockInfoProcessor(symbols) {
	var symbolsString = symbols.map(function(element) {
		return element.value;
	}).join();
	return priceService.processSymbols(symbolsString)
	.then(function(body){
		return JSON.parse(body);
	})
	.then(function(data){
		var stockInfoMessage = '';
		for (var index in data) {
			var arrData = data[index].toString().split('|');
			if (arrData.length > 0) {
				stockInfoMessage += priceService.prepareStockInfoMessageData(arrData);
			}
		}
		return stockInfoMessage;
	});
	
}

module.exports = {
	witProcessor: witProcessor,
	stockInfoProcessor: stockInfoProcessor
}
