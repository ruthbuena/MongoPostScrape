//Dependencies
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var request = require('request');
var cheerio = require('cheerio');


// Initialize Express
var app = express();
app.use(bodyParser.urlencoded({
  extended: false
}))

// Serve Static Content
app.use(express.static(process.cwd() + '/public'));

// Express-Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


// Database with Mongoose
mongoose.Promise = global.Promise;

if(process.env.NODE_ENV == 'production'){
  mongoose.createConnection('mongodb:mongodb://heroku_ql34r6h7:et0i8gh9uvluav5fpdpckrskv3@ds141474.mlab.com:41474/heroku_ql34r6h7');
}
else{
  mongoose.createConnection('mongodb://localhost/news-scraper');
}

var db = mongoose.connection;


db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});


db.once('openUri', function() {
  console.log('Mongoose connection successful.');
});

// Comment and Article models
var Comment = require('./models/Comment.js');
var Article = require('./models/Article.js');
// ---------------------------------------------------------------------------------------------------------------


var router = require('./controllers/scrape.js');
app.use('/', router);


// Launch App
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Running on port: ' + port);
});
