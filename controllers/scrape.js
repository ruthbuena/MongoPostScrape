// Dependencies
var express = require("express");
var router = express.Router();

var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");

router.get("/", function(req, res) {
  res.render("index");
});

// Get function to grab articles
router.get("/savedarticles", function(req, res) {
  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      var hbsArticleObject = {
        articles: doc
      };
      res.render("savedarticles", hbsArticleObject);
    }
  });
});

//request using cheerio to scrape for articles
router.post("/scrape", function(req, res) {
  request("http://www.nytimes.com/", function(error, response, html) {
    var $ = cheerio.load(html);

    var scrapedArticles = {};
    $("article h2").each(function(i, element) {

      var result = {};

      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      scrapedArticles[i] = result;
    });
    var hbsArticleObject = {
        articles: scrapedArticles
    };
    res.render("index", hbsArticleObject);
  });
});

// Save favorite articles with title and link
router.post("/save", function(req, res) {
  console.log("Article title: " + req.body.title);
  var newArticleObject = {};

  newArticleObject.title = req.body.title;
  newArticleObject.link = req.body.link;

  var entry = new Article(newArticleObject);
  console.log("We can save the article: " + entry);

  entry.save(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(doc);
    }
  });
  res.redirect("/savedarticles");
});

// Delete article by Id number then redirect to /savedarticles route
router.get("/delete/:id", function(req, res) {
  Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
    if (err) {
      console.log("Error:" + err);
    } else {
      console.log("Article has been deleted");
    }
    res.redirect("/savedarticles");
  });
});


router.get("/comments/:id", function(req, res) {
  Comment.findOneAndRemove({"_id": req.params.id}, function (err, doc) {
    if (err) {
      console.log("Error:" + err);
    } else {
      console.log("Article has been deleted");
    }
    res.send(doc);
  });
});

// Get article by Id number using .findOne
router.get("/articles/:id", function(req, res) {
  Article.findOne({"_id": req.params.id})
  .populate('comments')

  .exec(function(err, doc) {
    if (err) {
      console.log("Error");
    }
    else {
      console.log("Here is the article and comment " + doc);
      res.json(doc);
    }
  });
});

// Create new comment
router.post("/articles/:id", function(req, res) {
  var newComment = new Comment(req.body);
  newComment.save(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {comments: doc._id}}, {new: true, upsert: true})
      .populate('comments')
      .exec(function (err, doc) {
        if (err) {
          console.log("Erro");
        } else {
          console.log("Comment has been saved " + doc.comments);
          res.send(doc);
        }
      });
    }
  });
});

// Export router
module.exports = router;
