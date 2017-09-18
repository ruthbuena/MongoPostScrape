var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CommentSchema = new Schema({

  // Comment Author Info
  author: {
    type: String
  },
  content: {
    type: String
  }
});


var Comment = mongoose.model('Comment', CommentSchema);


module.exports = Comment;
