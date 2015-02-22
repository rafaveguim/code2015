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
var cheerio = require('cheerio');




// Data - containers
var occupationMap = {};
var projectionMap = {};
var changeMap = {};
var summaryMap = {};
var demandMap = {};
var supplyMap = {};
var schoolMap = {};


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







function getDatasetByType(type) {
  
  if (type === 'demand') return demandMap;
  if (type === 'supply') return supplyMap;
  if (type === 'projection') return projectionMap;
  if (type === 'change') return changeMap;
  if (type === 'school') return schoolMap;
  

  // Default
  return demandMap;
}


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
      t[i] = Math.round(t[i]);
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
    summaryMap[code].cumulative_growth = Math.round(t[2] * 1000);
    summaryMap[code].cumulative_retirement = Math.round(t[3 * 1000]);
    summaryMap[code].cumulative_other_replacement = Math.round(t[4] * 1000);
    summaryMap[code].cumulative_job_openings = Math.round(t[5] * 1000);
    summaryMap[code].cumulative_school_leavers = Math.round(t[6] * 1000);
    summaryMap[code].cumulative_immigrants = Math.round(t[7] * 1000);
    summaryMap[code].cumulative_job_seekers = Math.round(t[9] * 1000);
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

      // console.log( subtypes[i]);

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
parseTimeSeries("./data/school-leavers.csv", schoolMap);


// Test end point
/*
app.get('/test', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.send({A:1, B:2, C:[1,2,3]});
});
*/

// keywordStr ==> a+b+c 
function createURL(keywordStr) {
   return 'http://www5.hrsdc.gc.ca/NOC/English/NOC/2011/SearchDescriptionResult.aspx?val27=' + keywordStr + 
     '&val28=0&val29=0&val30=2&val31=2&val32=2&val33=2&val34=2&val35=2&val36=2&val37=2&val38=1&val39=0&val40=Section';
}


function getNOC(subtypeCode) {
   var keys = Object.keys(occupationMap);
   for (var i=0; i < keys.length; i++) {
     var codeArray = _.pluck(occupationMap[keys[i]].subtypes, 'subtypeCode');

     if (_.contains(codeArray, subtypeCode)) {
       return keys[i];
     }
   }
   return null;
}



// This scrapes off 
// http://www5.hrsdc.gc.ca/NOC/English/NOC/2011/SearchDescription.aspx
app.get('/apisearch', function(req, res) {

  var keywordStr = req.query.keywordStr;
  var start = req.query.start || 2012;
  var end = req.query.end || 2022;
  var type = req.query.type;
  var lookup = getDatasetByType(type);

  request({
    url: createURL(keywordStr),
    method: 'GET',
    headers: {
       'Accept': '*/*'
    },
  }, function(err, response, body) {
    var patt = new RegExp("ProfileDescription");
    var searchResult = [];
    var dupe = {};

    cc = cheerio.load(body);
    cc('a').map(function(i, link) {
      if (link.attribs.href && patt.test(link.attribs.href)) {
        var subtypeCode = link.children[0].data.split(' ')[0];
        var code = getNOC(subtypeCode);

        if (code !== null && ! dupe[code] ) {
          var sresult = {
            code: code,
            name: occupationMap[code].name,
            subtypeCode: occupationMap[code].subtypes
          };
          //searchResult.push(occupationMap[code]);
          searchResult.push( sresult );
          dupe[code] = 1;
        }
        console.log(link.children[0].data);
      }
    });


    // Append projection data
    // every thing starts in 2012
    start = start - 2012;
    end = end - 2012;
    searchResult.forEach(function(result) {
      var total = 0; 
      for (var i = start; i <= end; i++) {
        total += lookup[result.code][i];
      }
      result.total = total;
    });


    res.set('Content-Type', 'application/json');
    res.send(_.uniq(searchResult));

     

    //console.log(handler.dom);
  });
});


// For Chris to serve html contents
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


// Detail of a specific job
app.get('/detail', function(req, res) {
  var code = req.query.code;
  res.set('Content-Type', 'application/json');
  res.send({
    code: code,
    info: occupationMap[code],
    projections: projectionMap[code],
    changes: changeMap[code],
    supply: supplyMap[code],
    demand: demandMap[code],
    schoolLeavers: schoolMap[code]
  });
});


// Summary of a specific job
app.get('/summary', function(req, res) {
  var code = req.query.code;
  res.set('Content-Type', 'application/json');
  res.send({
    code: code,
    summary: summaryMap[code]
  });
});


app.get('/all-demands', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.send(demandMap);
});

app.get('/all-supplies', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.send(supplyMap);
});

app.get('/all-school-leavers', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.send(schoolMap);
});

app.get('/all-jobs', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.send(occupationMap);
});



// Get the top 10
app.get('/range', function(req, res) {
  var start = req.query.start || 2012;
  var end = req.query.end || 2022;
  var type = req.query.type;
  var size = req.query.size || 10;

  // every thing starts in 2012
  start = start - 2012;
  end = end - 2012;

  var lookup = getDatasetByType(type);

  var keys = Object.keys(lookup);
  var result = [];
  keys.forEach(function(key) {
    var total = 0; 
    for (var i = start; i <= end; i++) {
      total += lookup[key][i];
    }
    result.push({
      code: key,
      name: occupationMap[key] ? occupationMap[key].name : 'N/A',
      data: lookup[key],
      total: total
    });
  });

  result = _.sortBy(result, function(r) { return -r.total; });
  result.splice(size);

  res.set('Content-Type', 'application/json');
  res.send(result);
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


app.get('/search', function(req, res) {
  var q = req.query.q;
  var size = req.query.size || 10;

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

  result.forEach(function(r) {
    var code = r.original.code;
    // Get sub types
    r.code = code;
    r.name = occupationMap[code].name;
    r.subtypes = occupationMap[code].subtypes;
  });

  res.send({
    q: q,
    result: result.slice(0, size)
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

