//Dependencies
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Comment = require('./models/Comment.js');
var Article = require('./models/Article.js');

var request = require('request');
var cheerio = require('cheerio');

// Add for Mongoose Promise
mongoose.Promise = Promise;

var PORT = process.env.PORT || 3000;

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


var router = require('./controllers/scrape.js');
app.use('/', router);

// Database with Mongoose

var db = mongoose.connect('mongodb://heroku_ql34r6h7:et0i8gh9uvluav5fpdpckrskv3@ds141474.mlab.com:41474/heroku_ql34r6h7', {useMongoClient: true});


// var db = mongoose.connection;


db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});


db.once('open', function() {
  console.log('Mongoose connection successful.');
});


// Launch App

app.listen(PORT, function(){
  console.log('Running on port: ' + PORT);
});
