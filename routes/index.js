var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Raindrop', url: req.headers.host + req.url });
});

module.exports = router;
