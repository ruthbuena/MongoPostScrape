// Node Dependencies
var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require("mongoose");

mongoose.Promise = Promise;

var Comment = require('../models/Comment.js');
var Article = require('../models/Article.js');



// Main Page
router.get('/', function (req, res){
  res.render("index");
});


// Articles Page Render
router.get('/savedarticles', function (req, res){
  Article.find().sort({_id: -1})
    .populate('comments')
    .exec(function(err, doc){
      if (err){
        console.log(err);
      }
      else {
        var hbsObject = {articles: doc}
        res.render('savedarticles', hbsObject);
      }
    });
});


// Scrape
router.get('/scrape', function(req, res) {
  request('http://www.thewashingtonpost.com/local', function(error, response, html) {
    var $ = cheerio.load(html);
    var titlesArray = [];

    // Now, grab every everything with a class of "inner" with each "article" tag
    $("div.story-headline").each(function(i, element) {

        var result = {};

        result.title = $(this).children('header').children('h2').text().trim() + "";
        result.link = 'http://www.thewashingtonpost.com' + $(this).children('header').children('h2').children('a').attr('href').trim();
        result.summary = $(this).children('div').text().trim() + "";

        if(result.title !== "" &&  result.summary !== ""){

          if(titlesArray.indexOf(result.title) == -1){

            titlesArray.push(result.title);
            Article.count({ title: result.title}, function (err, test){

              if(test == 0){
                var entry = new Article (result);

                entry.save(function(err, doc) {
                  if (err) {
                    console.log(err);
                  }
                  else {
                    console.log(doc);
                  }
                });
              }
              else{
                console.log('Already in the database. Not saved to DB.')
              }
            });
        }
        else{
          console.log('Redundant Article.')
        }
      }
      else{
        console.log('Empty Content.')
      }
    });
    res.redirect("/articles");
  });
});



router.post("/save", function(req, res) {
  console.log("This is the title: " + req.body.title);

  var newArticleObject = {};
  newArticleObject.title = req.body.title;
  newArticleObject.link = req.body.link;

  var entry = new Article(newArticleObject);
  console.log("We can save the article: " + entry);

  // save entry to the db
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

router.get("/delete/:id", function(req, res) {
  console.log("ID is getting read for delete" + req.params.id);
  console.log("Able to activate delete function.");

  Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
    if (err) {
      console.log("Not able to delete:" + err);
    } else {
      console.log("Able to delete, Yay");
    }
    res.redirect("/savedarticles");
  });
});

router.get("/comments/:id", function(req, res) {
  console.log("ID is getting read for delete" + req.params.id);
  console.log("Able to activate delete function.");

  Comment.findOneAndRemove({"_id": req.params.id}, function (err, doc) {
    if (err) {
      console.log("Not able to delete:" + err);
    } else {
      console.log("Able to delete, Yay");
    }
    res.send(doc);
  });
});

//grab article by Id
router.get("/articles/:id", function(req, res) {
  console.log("ID is getting read" + req.params.id);
  Article.findOne({"_id": req.params.id})
  .populate('comments')
  .exec(function(err, doc) {
    if (err) {
      console.log("Not able to find article and get comments.");
    }
    else {
      console.log("We are getting article and maybe comments? " + doc);
      res.json(doc);
    }
  });
});

// Create a new comment
router.post("/articles/:id", function(req, res) {
  // Create a new comment and pass the req.body to the entry
  var newComment = new Comment(req.body);
  // And save the new comment the db
  newComment.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    else {
      // Use the article id to find it and then push comment
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {comments: doc._id}}, {new: true, upsert: true})

      .populate('comments')
      .exec(function (err, doc) {
        if (err) {
          console.log("Cannot find article.");
        } else {
          console.log("we are getting comments? " + doc.comments);
          res.send(doc);
        }
      });
    }
  });
});
// Export routes for server.js
module.exports = router;

//
// router.post('/add/comment/:id', function (req, res){
//
//   var articleId = req.params.id;
//   var commentAuthor = req.body.name;
//   var commentContent = req.body.comment;
//
//   var result = {
//     author: commentAuthor,
//     content: commentContent
//   };
//
//
//   var entry = new Comment (result);
//
//
//   entry.save(function(err, doc) {
//     if (err) {
//       console.log(err);
//     }
//     else {
//       Article.findOneAndUpdate({'_id': articleId}, {$push: {'comments':doc._id}}, {new: true})
//       .exec(function(err, doc){
//         if (err){
//           console.log(err);
//         } else {
//           res.sendStatus(200);
//         }
//       });
//     }
//   });
// });
//
//
// router.post('/remove/comment/:id', function (req, res){
//   var commentId = req.params.id;
//   Comment.findByIdAndRemove(commentId, function (err, todo) {
//     if (err) {
//       console.log(err);
//     }
//     else {
//       res.sendStatus(200);
//     }
//   });
// });
//
// module.exports = router;
