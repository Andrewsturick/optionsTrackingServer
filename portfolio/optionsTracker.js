
var Firebase    = require('firebase')
var marketRef   = new Firebase('https://rooftoptrading.firebaseio.com/market')
var marketArray = require('./marketArr')
var trackingHelpers = require('./trackingHelpers')
var CONST = require('./constants')
var _ = require('lodash');
var request = require('request')

module.exports = {
  trackOptionInfo: function(index){

      var now = Date.now()
      var refs = ['AAPL', 'GLD', 'TSLA', 'SPY']
      marketArray.marketArray.map(function(stock){

        var requestObj = new trackingHelpers.requestObj(stock.Symbol, index)
        request(requestObj, function(error, response, body){
          if(JSON.parse(body).options){
            var symbol    = JSON.parse(body).options.option[0].root_symbol;
            marketRef.child(stock.Symbol).child('currentEquityInfo').child('LastTradePriceOnly').once('value', function(snap){
              var symbolObj = new trackingHelpers.OptionsChainAndSymbolObject(stock.Symbol, body)
              var lastPrice = snap.val()
               symbolObj = trackingHelpers.enrichChain(symbolObj, lastPrice)

              marketRef.child(stock.Symbol).child('currentChains').child(CONST.expirations[index]).set(symbolObj)
            })
          }
        })
      })
  }
}
