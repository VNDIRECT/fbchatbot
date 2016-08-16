// Interaction with VNDS's priceservice api

'use strict';

const request = require('request');
const rp = require('request-promise');

function processSymbols(symbolsString) {
	var priceServiceUri = 'https://priceservice.vndirect.com.vn/priceservice/secinfo/snapshot/q=codes:';
	var combinedUri = priceServiceUri + symbolsString;
	var options = {
		method: 'GET',
		uri: combinedUri
	}
	return rp(options);
}

function prepareStockInfoMessageData(data) {
	var resultText = '';
	var marketInfoUri = 'https://priceservice.vndirect.com.vn/priceservice/market/snapshot/q=codes:10,02,03';
	var marketInfo = request.get(marketInfoUri, function(error, response, body){
		return JSON.parse(body);
	});
	var stockInfo = {
		floorCode: data[0],
		code: data[3],
		ceilingPrice: data[15],
		floorPrice: data[16],
		accumulatedVol: data[36],
		matchPrice: checkMatchPrice(data[0], data[19], data[12], data[11], data[39], marketInfo)
	}
	resultText += formatStockInfoData(stockInfo);
	resultText += '\n';
	return resultText;
}

function checkMatchPrice(floorCode, matchPrice, currentQtty, currentPrice, projectOpen, marketInfo) {
	if (floorCode == '02' || floorCode == '03') {
        if (currentPrice > 0) {
            if (isInATC(marketInfo)) {
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
        if (isInATO(marketInfo) || isInATC(marketInfo)) {
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
		+ 'Đang khớp giá: ' + stockInfo.matchPrice + '\n'
		+ 'Tổng KL đã khớp: ' + stockInfo.accumulatedVol * 10 + '\n'
		+ 'Sàn: ' + stockInfo.floorPrice + ' ' + 'Trần: ' + stockInfo.ceilingPrice + '\n'
}

module.exports = {
	prepareStockInfoMessageData: prepareStockInfoMessageData,
	processSymbols: processSymbols
}