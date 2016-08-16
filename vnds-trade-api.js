// Interaction with VNDS's trade-api

'use strict';

const request = require('request');
const rp = require('request-promise');
const utils = require('./utils');

function displayAccount(accountNumber) {
	var tempToken = "eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJpc3N1ZXIiLCJzdWIiOiJzdWJqZWN0IiwiYXVkIjpbImF1ZGllbmNlIiwiaW9zIiwib25saW5lIiwidHJhZGVhcGkiLCJhdXRoIl0sImV4cCI6MTQ3MTM1ODc5MSwibmJmIjoxNDcxMzI5NjkxLCJpZGdJZCI6Ik5vcm1hbFVzZXJzR3JvdXAvMDAwMTcxNTA5NCIsInNlY29uZEZhIjoiZmFsc2UiLCJyb2xlcyI6IltPTkxJTkVfVFJBRElORywgUk9MRV9PTkxJTkVfVFJBRElORywgT05MSU5FX1ZJRVdfQUNDT1VOVF9JTkZPLCBST0xFX09OTElORV9WSUVXX0FDQ09VTlRfSU5GT10iLCJjdXN0b21lcklkIjoiMDAwMTcxNTA5NCIsInZ0b3NBdXRoZW50aWNhdGVkIjoiZmFsc2UiLCJ1c2VySWQiOiJudWxsIiwiY3VzdG9tZXJOYW1lIjoiTmd1eeG7hW4gVG_DoG4gVGjhuq9uZyIsImVtYWlsIjoidGhhbmdudC5uaHRjazQ3QGZ0dS5lZHUudm4iLCJ1c2VybmFtZSI6InRoYW5nbnQubmh0Y2s0NyIsInN0YXR1cyI6Ik9OTElORV9BQ1RJVkUifQ.g7BminuE2nVgmbd_vzUQE2wFVAKMGrBRiroBX7hkthmOsdeqNw8DNpOB69zxnXKgbpIEniY1JsaNEtbp7zLcS9aHOHEBQZfA6Vs03ncXcDuRU9DzHuoQGA_svqHtUNralEcIANsiGWC_MCVvusxPFUBWjnsMqqUOl3Okip3MKCo1Nd_pjfBkf7sSkELEbjKHclc9x63FGRu_NzYY_dP0IsIZ5vgWNRAUg0qg9qYtVxabMTBdslk1OzWsdzaiw_JFdFzwmNjtZhSmEwoSpmdEbIp3siwfTNXgiQAbA75LYseWPQm8aDHgGOx1EJjt7Vke5a9DpH9N5nHMyTdb1Gj-BQ";

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
	var tempVTOSToken = "eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJpc3N1ZXIiLCJzdWIiOiJzdWJqZWN0IiwiYXVkIjpbImF1ZGllbmNlIiwiaW9zIiwib25saW5lIiwidHJhZGVhcGkiLCJhdXRoIl0sImV4cCI6MTQ3MTM4MDg5MiwibmJmIjoxNDcxMzUxNzkyLCJpZGdJZCI6Ik5vcm1hbFVzZXJzR3JvdXAvMDAwMTcxNTA5NCIsInNlY29uZEZhIjoidHJ1ZSIsInJvbGVzIjoiW09OTElORV9UUkFESU5HLCBST0xFX09OTElORV9UUkFESU5HLCBPTkxJTkVfVklFV19BQ0NPVU5UX0lORk8sIFJPTEVfT05MSU5FX1ZJRVdfQUNDT1VOVF9JTkZPXSIsImN1c3RvbWVySWQiOiIwMDAxNzE1MDk0IiwidnRvc0F1dGhlbnRpY2F0ZWQiOiJmYWxzZSIsInVzZXJJZCI6Im51bGwiLCJjdXN0b21lck5hbWUiOiJOZ3V54buFbiBUb8OgbiBUaOG6r25nIiwiZW1haWwiOiJ0aGFuZ250Lm5odGNrNDdAZnR1LmVkdS52biIsInVzZXJuYW1lIjoidGhhbmdudC5uaHRjazQ3Iiwic3RhdHVzIjoiT05MSU5FX0FDVElWRSJ9.bW6vPsNguBSURTeV2xwq0CyTXqaXVJSihqsTOv_GF9Z6zXUan3gbi03RZOdz1Qj5Af9XQ22jkYM4Q4lmOgz56pgDSAtWilktmoDK6r_LgwhOYtF52YcTF3Y1k8ipiPIv0qkFGCl6wRkqhvbctXfsomdL2q_lsEP2amPYW7Ckqcz-j8R0IvCXzGneOu-z8CyiC1egCxYw1Q63wbIDI6tBBB4gcgR9kVezMEhNogs6l69Nez1K3rZArkq9fyfcPxDUjLv6hTUKEfFLoMpY9ZNthLPBnpvsIOJfha0kpPF4t0PQ_lYPa2xxfj956ZB2FbtcfiJo2S7auOyau1GAE0Z1gg";
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