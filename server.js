var static = require('node-static'),
request = require("request"),
express = require('express');

////////////////////////////////////////////////////////////////////////////////
// Create a node-static server instance to serve the './page' folder
////////////////////////////////////////////////////////////////////////////////
var file = new(static.Server)('./');
var app  = express();



// Test end point
app.get('/test', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.send({A:1, B:2, C:[1,2,3]});
});





////////////////////////////////////////////////////////////////////////////////
// This needs to go last
////////////////////////////////////////////////////////////////////////////////
app.get(/\w*/, function(req, res){
   file.serve(req, res);
});

app.listen(8080);
console.log('Listening on port 8080. Cheers!...');
