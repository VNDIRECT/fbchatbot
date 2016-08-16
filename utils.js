'use strict';

/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
const crypto = require('crypto');
const config = require('./config');


function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', config.FB_APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function parsePortfolioStocksInfo(stocks) {
  var resultTextArray = [];
  for (let stock of stocks) {
    var symbol = stock.symbol;
    var quantity = stock.quantity;
    var currentPrice = parseFloat(stock.currentPrice) / 1000;
    var gainLossRatio = formattedRatio(stock.gainLossRatio);

    resultTextArray.push(generateStockResultText(symbol, quantity, currentPrice, gainLossRatio));
  }
  return resultTextArray;
}

function generateStockResultText(symbol, quantity, currentPrice, gainLossRatio) {
    var resultText = symbol + ' - '
      + 'KL:' + quantity + ' Giá:' + currentPrice;

    if (gainLossRatio < 0) {
      resultText += '\n🔽-' + (gainLossRatio * -1) + '%';
    } else {
      resultText += '\n🔼+' + gainLossRatio + '%';
    }

    return resultText;
}

function parsePortfolioGeneralInfo(data) {
  var resultText = '';
  resultText += '💰Giá trị thị trường của danh mục: ' + numberWithCommas(data.totalCurrentValue) + 'đ';

  var netProfitRatio = formattedRatio(data.ratio);
  if (netProfitRatio < 0) {
    resultText += '\nLỗ: 🔽-' + (netProfitRatio * -1) + '%';
  } else {
    resultText += '\nLãi: 🔼' + netProfitRatio + '%';
  }

  return resultText;
}

function formattedRatio(ratio) {
  return (parseFloat(ratio) * 100).toFixed(2);
}


module.exports = {
  verifyRequestSignature: verifyRequestSignature,
  parsePortfolioStocksInfo: parsePortfolioStocksInfo,
  parsePortfolioGeneralInfo: parsePortfolioGeneralInfo
};
