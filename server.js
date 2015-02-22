// Node
var static = require('node-static'),
request = require("request"),
express = require('express'),
passport = require("passport"),
session = require('express-session'),
LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;

fs = require('fs');
readline = require('readline');


var fuzzy = require('fuzzy');
var _ = require('lodash');



// Data - containers
var occupationMap = {};
var projectionMap = {};
var changeMap = {};
var summaryMap = {};
var demandMap = {};
var supplyMap = {};

// Just transcribed this since it is small
// See http://open.canada.ca/data/en/dataset/d635ff7d-0512-475c-8233-d19faa36d4f4

var employmentRate = [
  {
    'label': 'Less than Grade 9',
    '15 to 24 years':	23.8,
    '25 to 44 years': 48.8,
  },
  {
    'label': 'Some secondary school',	
    '15 to 24 years': 36.3,
    '25 to 44 years': 61.1
  },
  {
    'label': 'High school graduate',
    '15 to 24 years': 63.7,
    '25 to 44 years': 75.8
  },
  {
    'label': 'Some postsecondary',	
    '15 to 24 years': 55.4,
    '25 to 44 years': 73.2
  },
  {
    'label': 'Postsecondary certificate or diploma',
    '15 to 24 years': 77.8,
    '25 to 44 years': 86
  },
  {
    'label': 'Bachelors degree',
    '15 to 24 years': 71.8,
    '25 to 44 years': 85.6
  },
  {
    'label': 'Above bachelors degree',
    '15 to 24 years': 72.5,
    '25 to 44 years': 85.7
  }
];


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


function parseTimeSeries(file, map) {
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
    map[code] = t;
  });
}


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

    tokens[2] = tokens[2].replace(/^\"/, '');
    tokens[2] = tokens[2].replace(/\"$/, '');
    tokens[2] = tokens[2].trim();

    var subtypes = tokens[2].split(';');
    var subArray = [];
    
    for (var i=0; i < subtypes.length; i++) {
      subtypes[i] = subtypes[i].trim();

      console.log( subtypes[i]);

      subArray.push({
         subtypeCode: subtypes[i].split(' ')[0].trim(),
         name: subtypes[i].split(' ').splice(2).join(' ')
      });
    }
    

    occupationMap[tokens[0]] = {
      name: tokens[1],
      subtypes: subArray
    }

  });
  return occupationMap;
}


parseSummary("./data/summary.csv");
parseOccupationGrouping("./data/cops.csv");
parseTimeSeries("./data/projections.csv", projectionMap);
parseTimeSeries("./data/change.csv", changeMap);
parseTimeSeries("./data/all-demand.csv", demandMap);
parseTimeSeries("./data/all-supply.csv", supplyMap);


// Test end point
/*
app.get('/test', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.send({A:1, B:2, C:[1,2,3]});
});
*/


app.get('/module', function(req, res) {
  var page = req.query.page;
  fs.readFile('./client_module/'+page, function(err, data) {
    res.set('Content-Type', 'text/plain');
    res.send(data);
  });
});


app.get('/employment-rate', function(req, res) {
  res.send(employmentRate);
});


app.get('/query', function(req, res) {
  var code = req.query.code;
  res.set('Content-Type', 'application/json');
  res.send({
    code: code,
    info: occupationMap[code],
    projections: projectionMap[code],
    changes: changeMap[code],
    supply: supplyMap[code],
    demand: demandMap[code]
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


app.get('/search-job', function(req, res) {
  var q = req.query.q;

  // Flatten
  var searchList = [];
  Object.keys(occupationMap).forEach(function(key) {

    searchList.push({
      code: key,
      name: occupationMap[key].name + ' ' + _.pluck(occupationMap[key].subtypes, 'name').join(' ')
    });
  });

  var options = {
    pre: '<',
    post: '>',
    extract: function(el) { return el.name; }
  };
  var result = fuzzy.filter(q, searchList, options);

  res.send({
    q: q,
    result: result.slice(0, 5)
  });
});



////////////////////////////////////////////////////////////////////////////////
// This needs to go last
////////////////////////////////////////////////////////////////////////////////
app.get(/\w*/, function(req, res) {
  file.serve(req, res);
});

app.listen(8080);
console.log('Listening on port 8080. Enjoy your ramen !!!');

