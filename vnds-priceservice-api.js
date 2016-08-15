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
	// var marketInfo = request.get('https://priceservice.vndirect.com.vn/priceservice/market/snapshot/q=codes:10,02,03');
	// console.log(marketInfo.body);
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

function checkMatchPrice(floorCode, matchPrice, currentQtty, currentPrice, projectOpen) {
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

module.exports = {
	prepareStockInfoMessageData: prepareStockInfoMessageData,
	processSymbols: processSymbols
}