// Interaction with VNDS's trade-api

'use strict';

const request = require('request');
const rp = require('request-promise');
const utils = require('./utils');

function displayAccount(accountNumber) {
	console.log('here');
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
module.exports = {
	displayAccount: displayAccount
}