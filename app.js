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
const priceWatchApi = require('./vnds-pricewatch-api');
const tygiaApi = require('./tygia-api');
const utils = require('./utils');
const config = require('./config');
const sessions = config.sessions;

const messageGapTime = 200;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
	console.log('/webhook requested');
	fb.processRequest(req, function(message, senderId) { // we got a real message from user

		fb.pretendTyping(senderId); // pretend that the bot is typing...

		fb.findOrCreateUserSessionInfo(senderId).then(function(user) { // get user session info, including his facebook's profile

			bot.witProcessor(message, senderId).then(function(entities) {
				var intent = entities.intent ? entities.intent[0] : undefined;

				console.log(entities);

				if (!intent) {
					if (entities.symbol) { // not sure what the user's intent is, but they mentioned a symbol, so let's respond with some stock info anyway
						bot.processStockInfo(entities.symbol).then(function(stockInfoData){
							fb.sendButtonMessage(senderId, stockInfoData.resultText, stockInfoData.actionButtons);
						});
					} else {
						fb.sendTextMessage(senderId, `Em chưa hiểu ý ${user.pronounce} ${user.fbProfile.first_name}, ${user.pronounce} có thể nói rõ hơn được không ạ? Em có thể thực hiện những yêu cầu như:\n` +
							`  • Nhắn cho ${user.pronounce} khi FPT tăng quá 50\n` +
							`  • Cho tôi xem giá VNM\n` +
							`  • Giá vàng thế nào rồi nhỉ?\n` +
							`  • Giá dầu mới nhất\n` +
							`${user.pronounce} cũng có thể liên hệ với hotline của VNDIRECT theo số 1900-5454-09 hoặc email support@vndirect.com.vn để được trợ giúp tốt hơn ạ.`);
					}
				} else {
					switch(intent.value) {
						case 'stockInfo':
							if (entities.symbol) {
								bot.processStockInfo(entities.symbol).then(function(stockInfoData){
									fb.sendButtonMessage(senderId, stockInfoData.resultText, stockInfoData.actionButtons);
								});
							} else {
								fb.sendTextMessage(senderId, `Xin lỗi ${user.pronounce} ${user.fbProfile.first_name}, em không tìm thấy mã chứng khoán này.`);
							}
							break;

						case 'sayHi':
							fb.sendTextMessage(senderId, `⭐ Chào ${user.pronounce} ${user.fbProfile.first_name} ạ! ⭐ \nEm là Lan Hương, dịch vụ trả lời tự động của VNDIRECT.\nEm có thể hiểu những yêu cầu như:\n` +
								`  • Nhắn cho ${user.pronounce} khi FPT tăng quá 50\n` +
								`  • Cho tôi xem giá VNM\n` +
								`  • Giá vàng thế nào rồi nhỉ?\n` +
								`  • Giá dầu mới nhất\nRất hân hạnh được phục vụ ${user.pronounce}!`);
							break;

						case 'compliment':
							fb.sendTextMessage(senderId, `Cám ơn ${user.pronounce} ${user.fbProfile.first_name} ạ! Em mong được phục vụ ${user.pronounce} thường xuyên và được ${user.pronounce} giới thiệu với bạn bè nữa ạ! 😋`);
							break;

						case 'complain':
							fb.sendTextMessage(senderId, `😞 Xin lỗi ${user.pronounce} ${user.fbProfile.first_name} ạ, khả năng của em vẫn còn khá hạn chế. Em đang học hỏi để có thể đáp ứng các yêu cầu của ${user.pronounce} tốt hơn.\nTrong lúc đó, ${user.pronounce} có thể liên hệ với hotline của VNDIRECT theo số 1900-5454-09 ạ.`);
							break;

						case 'goodbye':
							fb.sendTextMessage(senderId, `Bye bye ${user.pronounce} ${user.fbProfile.first_name}! Khi nào cần, ${user.pronounce} lại nhắn tin cho em nhé!`);
							break;

						case 'whoAreYou':
							fb.sendTextMessage(senderId, `Em là Lan Hương, dịch vụ trả lời tự động của VNDIRECT. Em có thể giúp ${user.pronounce} xem giá chứng khoán, giá dầu, giá vàng.\nRất hân hạnh được phục vụ ${user.pronounce}!`);
							break;

						case 'thank':
							fb.sendTextMessage(senderId, `Không có gì đâu ạ, em rất vui được phục vụ ${user.pronounce}!`);
							break;

						case 'commoditiesPrice':

							if (entities.commodity) {
								if (entities.commodity[0].value == 'oil') {
									tygiaApi.getOilPrice().then(function(oilPrice) {
										fb.sendTextMessage(senderId, `Giá dầu tại thời điểm này đang là ${oilPrice} USD/thùng ạ.`);
									}, function() {
										fb.sendTextMessage(senderId, `Xin lỗi, em chưa lấy được giá dầu ạ 😞. Xin ${user.pronounce} vui lòng thử lại sau một chút nữa.`);
									});

								} else if (entities.commodity[0].value == 'gold') {
									tygiaApi.getGoldPrice().then(function(goldPrice) {
										fb.sendTextMessage(senderId, `Giá vàng thế giới:\n` +
											`- Mua: ${goldPrice.world.buy} USD/oz\n` +
											`- Bán: ${goldPrice.world.sell} USD/oz\n\n` +
											`SJC Hà Nội:\n` +
											`- Mua: ${goldPrice.sjcHanoi.buy} ₫\n` +
											`- Bán: ${goldPrice.sjcHanoi.sell} ₫\n\n` +
											`SJC Hồ Chí Minh:\n` +
											`- Mua: ${goldPrice.sjcHcm.buy} ₫\n` +
											`- Bán: ${goldPrice.sjcHcm.sell} ₫\n\n` +
											`SJC Bảo Tín Minh Châu:\n` +
											`- Mua: ${goldPrice.sjcBtmc.buy} ₫\n` +
											`- Bán: ${goldPrice.sjcBtmc.sell} ₫`);
									}, function() {
										fb.sendTextMessage(senderId, `Xin lỗi, em chưa lấy được dữ liệu giá vàng ạ 😞. Xin ${user.pronounce} vui lòng thử lại sau một chút nữa.`);
									});
								}
							}
							break;

						case 'priceAlert':
							var mode, modeLiteral, symbol, price;
							if (entities.side[0].value == 'over') {
								mode = 'gte';
								modeLiteral = 'tăng qua ngưỡng';
							} else if (entities.side[0].value == 'under') {
								mode = 'lte';
								modeLiteral = 'giảm qua ngưỡng';
							}
							symbol = entities.symbol[0].value;
							price = entities.price[0].value;
							priceWatchApi.priceAlert(symbol, price, mode, senderId).then(function() {
								fb.sendTextMessage(senderId, `Vâng, em sẽ báo cho ${user.pronounce} ngay khi giá ${symbol} ${modeLiteral} ${price} ạ.`);
							}, function() {

							});
							break;

						// TODO: login then query real account data
						// case 'accountInquiry':
						// 	fb.sendTextMessage(senderId, `Dạ, ${user.pronounce} muốn xem danh mục đầu tư ạ, ${user.pronounce} vui lòng đợi em một lát ạ...`);
						// 	fb.pretendTyping(senderId);
						// 	tradeApi.displayAccount('0001032425').then(function(data) {
						// 		setTimeout(function() {
						// 			fb.sendTextMessage(senderId, data[0]);
						// 		}, messageGapTime);
						// 		var count = 0;
						// 		for (let stockInfoDataTextItem of data[1]) {
						// 			count++;
						// 			// send facebook messages for stock info in order
						// 			setTimeout(function() {
						// 				fb.sendTextMessage(senderId, stockInfoDataTextItem);
						// 			}, count*messageGapTime);
						// 		}
						// 	});
						// 	break;

						// TODO: fix with real market advice in the future
						// case 'marketAdvice':
						// 	var side;
						// 	if (entities.side) {
						// 		if (entities.side[0].value == 'buy') {
						// 			side = 'mua';
						// 		} else if (entities.side[0].value == 'sell') {
						// 			side = 'bán';
						// 		}
						// 		if (entities.side.length == 1) {
						// 			if (Math.random() < 0.5) {
						// 				fb.sendTextMessage(senderId, `Có lẽ không nên ${side} mã ${entities.symbol[0].value} lúc này ${user.pronounce} ạ 🙈`);
						// 			} else {
						// 				fb.sendTextMessage(senderId, `Chuẩn, nên ${side} con ${entities.symbol[0].value} sớm ${user.pronounce} ạ! 👍`);
						// 			}
						// 		} else {
						// 			fb.sendTextMessage(senderId, `Không nên mua hay bán mã ${entities.symbol[0].value} vào thời điểm này, ${user.pronounce} nên theo dõi thị trường và đưa ra quyết định sau ạ.`);
						// 		}
						// 	} else {
						// 		fb.sendTextMessage(senderId, `Với mã ${entities.symbol[0].value}, em nghĩ ${user.pronounce} nên tin vào trực giác của mình.`);
						// 	}
						// 	break;

						//TODO: temporarily remove until authentication is resolved
						// case 'placeOrder':
						// 	var sideVal = '';
						// 	var qttyVal = '';
						// 	var symbolVal = '';
						// 	var priceVal = '';
						// 	if (entities.side) {
						// 		sideVal = entities.side[0].value;
						// 	}
						// 	if (entities.qtty) {
						// 		qttyVal = entities.qtty[0].value;
						// 	}
						// 	if (entities.symbol) {
						// 		symbolVal = entities.symbol[0].value;
						// 	}
						// 	if (entities.price) {
						// 		priceVal = entities.price[0].value;
						// 	}
						// 	if (sideVal != '' && qttyVal != '' && symbolVal != '' && priceVal != '') {
						// 		console.log(sideVal, qttyVal, symbolVal, priceVal);
						// 		tradeApi.placeOrder(sideVal, qttyVal, symbolVal, priceVal, '0001032425')
						// 			.then(function(textArray) {
						// 				var message = ''
						// 				if (textArray[0] == 'error') {
						// 					message = `Xin lỗi ${user.pronounce}, đặt lệnh không thành công. Em nhận được lỗi sau đây từ hệ thống: "${textArray[1]}"`
						// 				} else if (textArray[0] == 'success') {
						// 					message = textArray[1];
						// 				}

						// 				fb.sendTextMessage(senderId, message);
						// 			});
						// 	} else {
						// 		fb.sendTextMessage(senderId, `Có vẻ ${user.pronounce} đang muốn đặt lệnh phải không ạ? Mời ${user.pronounce} đặt lại lệnh với đầy đủ thông tin: mua/bán, khối lượng, giá, tên mã.`);
						// 	}
						// 	break;

						default:
							fb.sendTextMessage(senderId, `Xin lỗi ${user.pronounce} ${user.fbProfile.first_name}, em chưa có khả năng đáp ứng yêu cầu này của ${user.pronounce}. Xin ${user.pronounce} vui lòng liên hệ với hotline của VNDIRECT theo số 1900-5454-09 hoặc email support@vndirect.com.vn để được trợ giúp ạ.`);
							break;
					}
				}
			}).catch(function() {
				fb.sendTextMessage(senderId, `Em chưa hiểu ý ${user.pronounce} ${user.fbProfile.first_name}, ${user.pronounce} có thể nói rõ hơn được không ạ? Em có thể hiểu những câu như:\n` +
					`  • Nhắn cho ${user.pronounce} khi FPT tăng quá 50\n` +
					`  • Cho tôi xem giá VNM\n` +
					`  • Giá vàng thế nào rồi nhỉ?\n` +
					`  • Giá dầu mới nhất\n` +
					`${user.pronounce} cũng có thể liên hệ với hotline của VNDIRECT theo số 1900-5454-09 hoặc email support@vndirect.com.vn để được trợ giúp tốt hơn ạ.`);
			});

		});
	});
	res.sendStatus(200);
});

// handles a notify request from a notification server - someone's wanting us to reach out to an user to say something
app.get('/notify', function (req, res) {
	res.status(200).send();

	switch(req.query.type) {
		case 'priceWatch':
			var priceMovement;
			switch(req.query.mode) {
				case 'lte':
				case 'lt':
					priceMovement = 'giảm qua'
					break;
				case 'gte':
				case 'gt':
					priceMovement = 'tăng qua'
					break;
			}
			fb.sendTextMessage(req.query.senderId, `🔔 Giá ${req.query.symbol} vừa ${priceMovement} ngưỡng ${req.query.price}!`);
			bot.processStockInfo([{value: req.query.symbol}]).then(function(stockInfoData){
				fb.sendButtonMessage(req.query.senderId, stockInfoData.resultText, stockInfoData.actionButtons);
			});
			break;
	}
});

app.listen(PORT, function() {
	console.log('Listening on port ' + PORT);
});