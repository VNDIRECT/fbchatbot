// Interaction with Chau's PriceWatch API

'use strict';

const request = require('request');
const rp = require('request-promise');
const utils = require('./utils');
const config = require('./config');

function priceAlert(symbol, price, mode, senderId) {

	var options = {
		method: 'POST',
		url: 'http://pricewatch-146215.appspot.com/notifications',
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		},
		body: JSON.stringify({
			symbol: symbol,
			price: price,
			callback: `${config.APP_URL}/notify?type=priceWatch&symbol=${symbol}&price=${price}&mode=${mode}&senderId=${senderId}`,
			mode: mode
		})
	}

	return rp(options);
}

module.exports = {
	priceAlert: priceAlert
}