const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const AI = require('./src/AI');
const com = require('./src/common');

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb', parameterLimit: 50000 }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: false, limit: '50mb', parameterLimit: 50000 }));
app.use(express.json({limit: '50mb'}));

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('index')
});

app.post('/api/move', function (req, res) {
  const pace = req.body.pace;
  const play = JSON.parse(JSON.stringify(req.body.play), (k, v) => {
    if (typeof v === 'string' && v.indexOf('function') >= 0) {
      return eval(v);
    }
    return v;
  });

  const response = AI.init(pace, play)
  console.log('response', response)

  res.send(response)
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});