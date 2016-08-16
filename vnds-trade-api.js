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
	var tempVTOSToken = "eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJpc3N1ZXIiLCJzdWIiOiJzdWJqZWN0IiwiYXVkIjpbImF1ZGllbmNlIiwiaW9zIiwib25saW5lIiwidHJhZGVhcGkiLCJhdXRoIl0sImV4cCI6MTQ3MTM3MjY2MCwibmJmIjoxNDcxMzQzNTYwLCJpZGdJZCI6Ik5vcm1hbFVzZXJzR3JvdXAvMDAwMTcxNTA5NCIsInNlY29uZEZhIjoidHJ1ZSIsInJvbGVzIjoiW09OTElORV9UUkFESU5HLCBST0xFX09OTElORV9UUkFESU5HLCBPTkxJTkVfVklFV19BQ0NPVU5UX0lORk8sIFJPTEVfT05MSU5FX1ZJRVdfQUNDT1VOVF9JTkZPXSIsImN1c3RvbWVySWQiOiIwMDAxNzE1MDk0IiwidnRvc0F1dGhlbnRpY2F0ZWQiOiJmYWxzZSIsInVzZXJJZCI6Im51bGwiLCJjdXN0b21lck5hbWUiOiJOZ3V54buFbiBUb8OgbiBUaOG6r25nIiwiZW1haWwiOiJ0aGFuZ250Lm5odGNrNDdAZnR1LmVkdS52biIsInVzZXJuYW1lIjoidGhhbmdudC5uaHRjazQ3Iiwic3RhdHVzIjoiT05MSU5FX0FDVElWRSJ9.sfcKKHtRdCFe2bMYVKDuycmLn5o0m1KMSZUYF4Z6sHUu7aX7g8m5v3cYemQED75-QSYVIvL2cAlk1HW5MlejNL6tMSU5bIfqTO7O84j5k9yfTeGhEkU_Urm-SPkFYgE2XT4leUEONwsopIlqmFAqTR8d8Pq-99S-QjesXRw6O3U3fBK4iWvplRmTaCbxz--JMXTYNZqC9isj1Is7cmKOVZl3cBnw6PxpJK7gGeRIryUOuX0iyY_yP-NrGk6jIBQ7n58ye2Blkvg8IiEVOsO2e2iFWYhiwnJbl5rHgOYLhgA2QoQvg26PFQsew0ybs2msNk4TlvMU14BPUKTxwH_bZw";
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
			price: priceVal,
			orderType: 'LO'
		}
	}

	return rp(options).then(function(response) {
		var parsedSuccessMessage = JSON.parse(JSON.stringify(response));
		console.log(parsedSuccessMessage);
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