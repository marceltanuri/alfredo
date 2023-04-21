const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
var mobile = require('is-mobile');

module.exports = function start(port) {

  if(port == undefined || isNaN(port)){
    port = 3000
  }

  router.get('/', function (req, res) {

    if (mobile({ ua: req })) {
      res.sendFile(path.join(__dirname + '/public/index_mob.html'));
    } else {
      res.sendFile(path.join(__dirname + '/public/index.html'));
    }
  });

  app.use('/css', express.static(__dirname + '/public/css'));
  app.use('/js', express.static(__dirname + '/public/js'));
  app.use('/img', express.static(__dirname + '/public/img'));
  app.use('/data', express.static(__dirname + '/public/data'));


  app.use('/', router);
  app.listen(process.env.port || port);

  console.log(`Running at Port ${port}`);

}

