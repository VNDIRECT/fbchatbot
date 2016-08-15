'use strict';

// Require dependencies
const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const rp = require('request-promise');

// Load our code
const fb = require('./facebook');
const bot = require('./bot');
const tradeApi = require('./vnds-trade-api');
const priceApi = require('./vnds-priceservice-api');
const utils = require('./utils');
const config = require('./config');
const sessions = config.sessions;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setup bot
// const wit = bot.getWit();

// Webserver parameter
const PORT = process.env.PORT || 8445;

app.get('/webhook', function(req, res) {
 	if (req.query['hub.mode'] === 'subscribe' &&
    	req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
    	console.log("Validating webhook");
    	res.status(200).send(req.query['hub.challenge']);
  	} else {
    	console.error("Failed validation. Make sure the validation tokens match.");
    	res.sendStatus(403);          
  	}
});

app.post('/webhook', function (req, res) {
	var data = req.body;

	fb.processRequest(req, function(message, senderId) {
		converse(message, senderId);
		res.sendStatus(200);
	});
	
});

function converse(messageText, recipientId) {
	var witUrl = 'https://api.wit.ai/message?q=' + encodeURIComponent(messageText);
	var options = {
		method: 'GET',
		url: witUrl,
		headers: {
			Authorization: 'Bearer ' + config.WIT_TOKEN  
		}
	};
	rp(options)
		.then(function(response) {
			console.log(response);
			var jsonBody = JSON.parse(response);
			return jsonBody.entities;
		})
		.then(function(entities) {
			var resultText = '';
			// console.log(entities);
			console.log(entities.intent[0].value);
			var intent = entities.intent[0];
			if (intent == undefined) {
				resultText = 'Xin lỗi, tôi chưa hiểu yêu cầu của quý khách.';
			} else {
				switch(intent.value) {
					case 'stockInfo':
						var symbols = entities.symbol;
						if (symbols.length > 0) {
							for (var index in symbols) {
								resultText += symbols[index].value;
								resultText += ' ';
							}
						} else {
							resultText = 'Xin lỗi, tôi không tìm thấy mã chứng khoán này.'
						}
						break;
					case 'sayHi':
						resultText = 'Chào bạn. ;)'
						break;
					default:
						resultText = 'Xin lỗi, tôi hiểu yêu cầu của bạn, nhưng tôi không biết phải làm gì.';
				}
			}
			return resultText;
		})
		.then(function(resultText) {
			fb.sendTextMessage(recipientId, resultText);
		});
	// request.get(options, function(error, response, body) {
	// 	var stocks = [];
	// 	if (response.statusCode == 200 && !error) {
	// 		var jsonBody = JSON.parse(response.body);
	// 		return jsonBody.entities;
	// 		if (jsonBody.entities.intent == undefined) {
	// 			resultText = 'Xin lỗi, tôi chưa hiểu yêu cầu của quý khách.'
	// 		} else {
	// 			// intent = jsonBody.entities.intent[0].value;
	// 			return jsonBody.entities;
	// 		}
	// 	}
	// });
	// request.get(options, function(error, response, body) {
	// 	var resultText = '';
	// 	var intent = '';
	// 	var stocks = [];
	// 	if (response.statusCode == 200 && !error) {
	// 		var jsonBody = JSON.parse(response.body);
	// 		if (jsonBody.entities.intent == undefined) {
	// 			resultText = 'Xin lỗi, tôi chưa hiểu yêu cầu của quý khách.'
	// 		} else {
	// 			intent = jsonBody.entities.intent[0].value;
	// 			stocks = jsonBody.entities.symbol;
	// 			resultText = 'Quý khách muốn ' + intent + ' của ';

	// 			if (stocks.length > 0) {	
	// 				for (var index in stocks) {
	// 					var symbol = stocks[index].value;
	// 					resultText += symbol;
	// 					resultText += ' ';
	// 				}
	// 			} else {
	// 				resultText = 'Không tìm thấy mã.';
	// 			}
	// 		}
	// 	} else {
	// 		resultText = 'Xin lỗi, tôi chưa hiểu yêu cầu của quý khách.';
	// 	}
	// 	var messageData = prepareMessageData(recipientId, resultText);
	// 	callSendAPI(messageData);
	// 	switch(intent) {
	// 		case 'stockInfo':
	// 			if (stocks.length > 0) {
	// 				var stockSymbolsString = stocks.map(function(element) {
	// 					return element.value;
	// 				}).join();
	// 				var priceServiceUri = 'https://priceservice.vndirect.com.vn/priceservice/secinfo/snapshot/q=codes:';
	// 				var combinedUri = priceServiceUri + stockSymbolsString;
	// 				var options = {
	// 					method: 'GET',
	// 					uri: combinedUri
	// 				}
	// 				rp(options)
	// 					.then(function(body) {
	// 						console.log('body ' + body);
	// 						return JSON.parse(body);
	// 					})
	// 					.then(function(data) {
	// 						console.log('data ' + data);
	// 						var stockInfoMessage = '';
	// 						for (var index in data) {
	// 							var arrData = data[index].toString().split('|');
	// 							if (arrData.length > 0) {
	// 								stockInfoMessage += prepareStockInfoMessageData(arrData);
	// 							}
	// 						}
	// 						var stockInfoMessageData = prepareMessageData(recipientId, stockInfoMessage);
	// 						callSendAPI(stockInfoMessageData);
	// 					});
	// 				console.log('done')
	// 			}
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// });
}

function prepareStockInfoMessageData(data) {
	var resultText = '';
	var marketInfo = request.get('https://priceservice.vndirect.com.vn/priceservice/market/snapshot/q=codes:10,02,03');
	console.log(marketInfo.body);
	var stockInfo = {
		floorCode: data[0],
		code: data[3],
		ceilingPrice: data[15],
		floorPrice: data[16],
		matchQtty: data[20]
		// matchPrice: checkMatchPrice(data[0], data[19], data[12], data[11], data[39])
	}
	resultText += formatStockInfoData(stockInfo);
	resultText += '\n';
	return resultText;
}

function checkMatchPrice(floorCode, matchPrice, currentQtty, currentPrice, projectOpen, marketInfo) {
	if (floorCode == '02' || floorCode == '03') {
        if (currentPrice > 0) {
            if (isInATC) {
                return currentPrice;
            } else if (currentQtty > 0) {
                return currentPrice;
            } else {
                return 0;
            }
        } else {
            return matchPrice;
        }
    } else if (floorCode == '10') {
        if (isInATO || isInATC) {
            return projectOpen;
        } else {
            return matchPrice;
        }
    }
}

function isInATO(marketInfo){
    if (marketInfo.floorCode == "10") {
        if (marketInfo.status == "P" || marketInfo.status == "2"){
            return true;
        }
    } else {
        return false;
    }
}

function isInATC(marketInfo){
    if (marketInfo.status == "A" || marketInfo.status == "9" || (marketInfo.floorCode == "02" && marketInfo.status == "30")) {
        return true;
    } else {
        return false;
    }
}
function formatStockInfoData(stockInfo) {
	return stockInfo.code + ': ' + '\n'
		+ 'Sàn: ' + stockInfo.floorPrice + '\n'
		+ 'Trần: ' + stockInfo.ceilingPrice + '\n'
		+ 'KL khớp gần nhất: ' + stockInfo.matchQtty + '\n;'
}

function prepareMessageData(recipientId, text) {
	return {
		recipient: {
			id: recipientId
		},
		message: {
			text: text,
			metadata: "DEVELOPER_DEFINED_METADATA"
		}
	};
}

app.listen(PORT, function() {
	console.log('Listening on port ' + PORT);
});