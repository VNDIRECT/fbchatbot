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

function processStockInfo(symbols) {
	var symbolsString = symbols.map(function(element) {
		return element.value;
	}).join();

	return priceService.processSymbols(symbolsString)
		.then(function(body){
			return JSON.parse(body);
		})
		.then(function(data){
			var stockInfoMessage = '';
			for (let dataItem of data) {
				var arrData = dataItem.toString().split('|');
				if (arrData.length > 0) {
					stockInfoMessage += priceService.prepareStockInfoMessageData(arrData);
				}
			}
			// generate buttons array for facebook buttons
			var actionButtons = [];
			for (let symbol of symbols) {
				actionButtons.push({
					type: 'web_url',
					url: 'https://banggia.vndirect.com.vn/chung-khoan/mobile/co-phieu/' + symbol.value.toUpperCase(),
					title: 'Xem chi tiết mã ' + symbol.value
				});
			}
			return {
				resultText: stockInfoMessage,
				actionButtons: actionButtons
			};
		});
}

module.exports = {
	witProcessor: witProcessor,
	processStockInfo: processStockInfo
}
