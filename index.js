var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen((process.env.PORT || 8000), function() {
    console.log("Listening for connections on port 8000.");
});