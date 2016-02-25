var express = require('express')
var router = express.Router();

var tracker = require('../portfolio/optionsTracker.js')

router.get('/:index', function(req, res){
  tracker.trackOptionInfo(req.params.index)
  res.send("done")
})

module.exports = router;
