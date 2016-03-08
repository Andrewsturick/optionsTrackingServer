'use strict';

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var request = require('request')
var CONST = require('./portfolio/constants')
var app = express();
var cronJob = require('cron').CronJob;
var PORT = process.env.PORT || 3009;


app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/options', require('./routes/options'))


function runAPICycle(){
    var minute = 0
    runCycle()
    function runCycle(){
      setTimeout(function(){
        request(`http://localhost:${PORT}/options/${minute%2}`,function(error, response, body){
          if(minute< 420){
            runCycle()
            minute++
          }
        })
      },60000)
    }
}



var runCycle = new cronJob('00 29 06 * * 1-5', function(){
  runAPICycle()
});
runCycle.start();






app.listen(PORT);
