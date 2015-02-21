// Node
var static = require('node-static'),
request = require("request"),
express = require('express'),
passport = require("passport"),
session = require('express-session'),
LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;

fs = require('fs');
readline = require('readline');


// Data
var occupationMap = {};
var projectionMap = {};
var changeMap = {};
var summaryMap = {};


// Authentication
var authLinkedInCallbackUrl = "http://localhost:8080/auth/linkedin/callback",
    LINKEDIN_KEY    = "78y246zab90skx",
    LINKEDIN_SECRET = "7SOVUfEnmZECECCb";


////////////////////////////////////////////////////////////////////////////////
// Create a node-static server instance to serve the './page' folder
////////////////////////////////////////////////////////////////////////////////
var file = new(static.Server)('./');
var app  = express();

///////////////////////////////////////////////////////////////////////////////
// Configuration
///////////////////////////////////////////////////////////////////////////////
app.use(express.static('public'));
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());


function parseSummary(file) {
  var rd = readline.createInterface({
    input: fs.createReadStream( file ),
    terminal: false
  });

  rd.on('line', function(line) {
    var t = line.split(',');
    var code = t[0];

    summaryMap[code] = {};
    summaryMap[code].cumulative_growth = t[2] * 1000;
    summaryMap[code].cumulative_retirement = t[3 * 1000];
    summaryMap[code].cumulative_other_replacement = t[4] * 1000;
    summaryMap[code].cumulative_job_openings = t[5] * 1000;
    summaryMap[code].cumulative_school_leavers = t[6] * 1000;
    summaryMap[code].cumulative_immigrants = t[7] * 1000;
    summaryMap[code].cumulative_job_seekers = t[9] * 1000;
    summaryMap[code].projected_assessment = t[12]; // Balanced  or Shortage
  });
}


function parseOccupationGrouping(file) {
  var rd = readline.createInterface({
    input: fs.createReadStream( file ),
    terminal: false
  });

  rd.on('line', function(line) {
    line = line.replace(/,\"/g, '\|\"');
    var tokens = line.split('\|');
    tokens[1] = tokens[1].replace(/^\"/, '');
    tokens[1] = tokens[1].replace(/\"$/, '');
    occupationMap[tokens[0]] = tokens[1];
  });
  return occupationMap;
}


function parseProjections(file) {
  var rd = readline.createInterface({
    input: fs.createReadStream( file ),
    terminal: false
  });

  rd.on('line', function(line) {
    var t = line.split(',');

    // Extract code
    var code = t.shift();

    // Unit is in thousands
    for (var i=0; i < t.length; i++) {
      t[i] *= 1000;
    }
    projectionMap[code] = t;
  });
}


function parseChanges(file) {
  var rd = readline.createInterface({
    input: fs.createReadStream( file ),
    terminal: false
  });

  rd.on('line', function(line) {
    var t = line.split(',');

    // Extract code
    var code = t.shift();

    // Unit is in thousands
    for (var i=0; i < t.length; i++) {
      t[i] *= 1000;
    }
    changeMap[code] = t;
  });
}


parseSummary("./data/summary.csv");
parseOccupationGrouping("./data/cops.csv");
parseProjections("./data/projections.csv");
parseChanges("./data/change.csv");


// Test end point
app.get('/test', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.send({A:1, B:2, C:[1,2,3]});
});


app.get('/query', function(req, res) {
  var code = req.query.code;
  res.set('Content-Type', 'application/json');
  res.send({
    code: code, 
    name: occupationMap[code],
    projections: projectionMap[code],
    changes: changeMap[code]
  });
});


app.get('/summary', function(req, res) {
  var code = req.query.code;
  res.set('Content-Type', 'application/json');
  res.send({
    code: code, 
    summary: summaryMap[code]
  });
});

/////////////////////////////////////////////////////////////////////////////
// LinkedIn Authentication
/////////////////////////////////////////////////////////////////////////////
passport.use(new LinkedInStrategy({
  clientID: LINKEDIN_KEY,
  clientSecret: LINKEDIN_SECRET,
  callbackURL: authLinkedInCallbackUrl,
  scope: ['r_basicprofile'],
  state: true
}, function(accessToken, refreshToken, profile, done) {
      console.log(accessToken);
    console.log(refreshToken);
  process.nextTick(function () {
    // To keep the example simple, the user's LinkedIn profile is returned to 
    // represent the logged-in user. In a typical application, you would want 
    // to associate the LinkedIn account with a user record in your database, 
    // and return that user instead.

    return done(null, profile);
  });
}));

app.get('/auth/linkedin',
  passport.authenticate('linkedin'),
  function(req, res){
    // The request will be redirected to LinkedIn for authentication, so this 
    // function will not be called. 
  });

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  successRedirect: '/',
  failureRedirect: '/login'
}));


////////////////////////////////////////////////////////////////////////////////
// This needs to go last
////////////////////////////////////////////////////////////////////////////////
app.get(/\w*/, function(req, res){
   file.serve(req, res);
});

app.listen(8080);
console.log('Listening on port 8080. Enjoy your burrito!...');
