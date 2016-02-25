
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
        if(refs.indexOf(stock.Symbol) > -1){
         marketRef.child(stock.Symbol).child('currentChains').child('2016-03-18').once('value', function(snap){
           marketRef.child(stock.Symbol).child('optionsTrackerToday').child(now).set(snap.val())
         })
        }
        // var requestObj = new trackingHelpers.requestObj(stock.Symbol, index)
        // request(requestObj, function(error, response, body){
        //   if(JSON.parse(body).options){
        //     var symbol    = JSON.parse(body).options.option[0].root_symbol;
        //     var symbolObj = new trackingHelpers.OptionsChainAndSymbolObject(stock.Symbol, body)
        //     var lastPrice = market[stock.Symbol].currentEquityInfo.LastTradePriceOnly
        //     var symbolObj = trackingHelpers.enrichChain(symbolObj, lastPrice)
        //     marketRef.child(stock.Symbol).child('currentChain').remove()
        //     marketRef.child(stock.Symbol).child('currentChains').child(CONST.expirations[index]).set(symbolObj)
        //   }
        // })
      })
  }
}
