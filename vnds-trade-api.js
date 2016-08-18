// Interaction with VNDS's trade-api

'use strict';

const request = require('request');
const rp = require('request-promise');
const utils = require('./utils');

function displayAccount(accountNumber) {
	var tempToken = process.env.ORDER_TOKEN;

	var options = {
		method: 'GET',
		url: 'https://trade-api.vndirect.com.vn/accounts/' + accountNumber + '/portfolio',
		headers: {
			'X-AUTH-TOKEN': tempToken
		}
	}

	return rp(options).then(function(response) {
		return JSON.parse(response);
	}).then(function(data) {
		var portfolioGeneralInfo = utils.parsePortfolioGeneralInfo(data);
		var portfolioStocksInfo = utils.parsePortfolioStocksInfo(data.stocks);
		var infoArray = [portfolioGeneralInfo, portfolioStocksInfo]
		return infoArray;
	});
}

function placeOrder(sideVal, qttyVal, symbolVal, priceVal, accountNumber) {
	var tempVTOSToken = process.env.ORDER_TOKEN;
	var side = (sideVal == 'buy' ? 'NB' : 'NS');
	var options = {
		method: 'POST',
		url: 'https://trade-api.vndirect.com.vn/accounts/' + accountNumber + '/orders/new_order_requests',
		headers: {
			'X-AUTH-TOKEN': tempVTOSToken,
			'Content-Type': 'application/json'
		},
		json: {
			side: side,
			quantity: qttyVal,
			symbol: symbolVal,
			price: parseFloat(priceVal) * 1000,
			orderType: 'LO'
		}
	}

	return rp(options).then(function(response) {
		return ['success', 'Đặt lệnh thành công! :D'];
	}).catch(function(error, response) {
		var parsedErrorMessage = JSON.parse(JSON.stringify(error));
		return ['error', parsedErrorMessage.error.message];
	});
}

module.exports = {
	displayAccount: displayAccount,
	placeOrder: placeOrder
}