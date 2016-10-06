// Interaction with Tygia's API

'use strict';

const request = require('request');
const rp = require('request-promise');
const utils = require('./utils');

function getOilPrice() {

	var options = {
		method: 'GET',
		url: 'https://www.tygia.com/json.php?ran=0&rate=1&gold=1&bank=VIETCOM&date=now',
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	}

	return rp(options).then(function(response) {
		response = response.substring(1); // remove the first dodgy character from the API response
		response = JSON.parse(response);

		var oilItems = response.golds[0].value.filter(function(obj) {
			return (obj.brand === 'OIL');
		});

		if (oilItems && (oilItems.length > 0)) {
			return oilItems[0].buy;
		} else {
			reject();
		}
	});
}

function getGoldPrice() {
	var options = {
		method: 'GET',
		url: 'https://www.tygia.com/json.php?ran=0&rate=1&gold=1&bank=VIETCOM&date=now',
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	}

	return rp(options).then(function(response) {
		response = response.substring(1); // remove the first dodgy character from the API response
		response = JSON.parse(response);

		var result = {};

		// find world price
		var goldItems = response.golds[0].value.filter(function(obj) {
			return (obj.brand === 'SPOT GOLD');
		});
		if (goldItems && (goldItems.length > 0)) {
			result.world = goldItems[0];
		} else {
			reject();
		}

		// find SJC Hanoi price
		goldItems = response.golds[0].value.filter(function(obj) {
			return ((obj.brand === 'Hà Nội') && (obj.company === 'SJC'));
		});
		if (goldItems && (goldItems.length > 0)) {
			result.sjcHanoi = goldItems[0];
		} else {
			reject();
		}

		// find SJC HCM price
		goldItems = response.golds[0].value.filter(function(obj) {
			return ((obj.brand === 'Hồ Chí Minh') && (obj.company === 'SJC'));
		});
		if (goldItems && (goldItems.length > 0)) {
			result.sjcHcm = goldItems[0];
		} else {
			reject();
		}

		// find SJC BTMC price
		goldItems = response.golds[0].value.filter(function(obj) {
			return (obj.brand === 'BẢO TÍN MINH CHÂU');
		});
		if (goldItems && (goldItems.length > 0)) {
			result.sjcBtmc = goldItems[0];
		} else {
			reject();
		}

		return result;
	});
}

module.exports = {
	getOilPrice: getOilPrice,
	getGoldPrice: getGoldPrice
}