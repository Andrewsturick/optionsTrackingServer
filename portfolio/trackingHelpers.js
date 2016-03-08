'use strict'
var request = require('request');
var marketRef   = new Firebase('https://rooftoptrading.firebaseio.com/market')
var greeks = require('greeks')
var IV     = require('implied-volatility')
var moment = require('moment')
var CONST = require('./constants')
/////helper to helpers, not exported, organizes option chain by strike price
var combineOptionsAtSameStrikePrice = function(data){
  var strikeHolder = {};

  for(var line in data){
    data[line].numberStrike       = data[line].strike;
    var str                       = data[line].strike;
    str                           = str.toString().replace('.', '@');

    data[line].strike = str;
    strikeHolder[data[line].strike] ? addToStrike(data[line], strikeHolder)
    : makeNewStrike(data[line], strikeHolder)


    ////if strike already in object, add teh new call or put object
    function addToStrike(line, strikeHolder){
      sortCallsAndPuts(line)
    };

    ///if strike not already in object, make a new object for the strike THEN add the call or put
    function makeNewStrike(line, strikeHorder){
      strikeHolder[line.strike] = {};
      strikeHolder[line.strike].numberStrike = line.numberStrike;
      sortCallsAndPuts(line, [strikeHolder[line.strike]]);

    };

    ///sorts calls and puts for hte above functions
    function sortCallsAndPuts(line){
      if(line.option_type == "put"){
        strikeHolder[line.strike].put = line;
      }  else{
        strikeHolder[line.strike].call = line;
      };
    };
  }
  return strikeHolder;
};

//calculates days until expireation...divide by 365 to get in decimal form
var yearsToExp = function(expDate){
    var eventdate = moment(expDate);
    var todaysdate = moment();
    return eventdate.diff(todaysdate, 'days');
}
//worker function to put greeks in options, if available
function enrichOption(lastPrice, chain, type){
  console.log(lastPrice);
    var expDate = chain.expiration_date;
    if(type=="call"){
      console.log('58 ',(chain.ask+chain.bid)/2, Number(lastPrice), Number(chain.strike.replace("@", ".")), yearsToExp(expDate)/365, .03, "call");
      var iv = IV.getImpliedVolatility((chain.ask+chain.bid)/2, Number(lastPrice), Number(chain.strike.replace("@", ".")), yearsToExp(expDate)/365, .03, "call")
      console.log(iv);
    } else{
      console.log('61 ', (chain.ask+chain.bid)/2, Number(lastPrice), Number(chain.strike.replace("@", ".")), yearsToExp(expDate)/365, .03, "put");
      var iv = IV.getImpliedVolatility((chain.ask+chain.bid)/2, Number(lastPrice), Number(chain.strike.replace("@", ".")), yearsToExp(expDate)/365, .03, "put")
      console.log(iv);
    }

    chain.iv = iv;
    chain.delta = greeks.getDelta( Number(lastPrice), Number(chain.strike.replace("@", ".")), yearsToExp(expDate)/365, iv, 0.03, type)
    chain.gamma = greeks.getGamma(Number(lastPrice), Number(chain.strike.replace("@", ".")), yearsToExp(expDate)/365, iv, 0.03, type)
    chain.vega = greeks.getVega(Number(lastPrice), Number(chain.strike.replace("@", ".")), yearsToExp(expDate)/365, iv, 0.03, type )
    chain.theta = greeks.getTheta(Number(lastPrice), Number(chain.strike.replace("@", ".")), yearsToExp(expDate)/365, iv, 0.03, type )

    return chain
}








//////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////



module.exports = {
////puts together queries for yql
  makeQuery : function(array){
    return array.map(function(stock ,index ,array){
      if(index==0){
        return '(' + stock
      }
      else{
        return ',' + stock
      }
    })
  },


  //makes request objects for optionsChains
  requestObj : function(symbol, index){
    this.url     =  'https://sandbox.tradier.com/v1/markets/options/chains?symbol=' + symbol +`&expiration=${CONST.expirations[index]}`,
    this.headers =  {
      Authorization: 'Bearer evNx9FonKHOCFdNvR9XHd7z4FsZ9',
      Accept: 'application/json'
    }
    return this;
  },


  ///makes nice options chain object with calls and puts on same lines
  OptionsChainAndSymbolObject: function(symbol, body){
    var symbolObj = {};
    symbolObj.symbol = symbol;
    symbolObj.chain = JSON.parse(body).options.option;
    symbolObj.chain = combineOptionsAtSameStrikePrice(symbolObj.chain)
    return symbolObj
  },

  //makes array of symbols for later use
  portfolioSymbolArray: function(optionsObj){
    var portfolioSymbolArray =[];
    for ( var position in optionsObj){
       portfolioSymbolArray.push( '"'  + position + '"')
    }
    return  portfolioSymbolArray
  },

////enriches option data with greeks
  enrichChain: function(obj, lastPrice){
      for (var strike in obj.chain){
        obj.chain[strike].call = enrichOption(lastPrice, obj.chain[strike].call, "call")
        obj.chain[strike].put = enrichOption(lastPrice, obj.chain[strike].put, "put")
      }
    return obj
  }
}
