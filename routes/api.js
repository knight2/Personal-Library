/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
  .get(function (req, res){
    //response will be array of book objects
    //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(process.env.DB, function(err, client){
        if (err) throw err;
       var database = client.db('books');
    database.collection('books').find().toArray(function(err, result){
      if (err){console.log('err')}
      
      for (var i = 0; i < result.length; i++){
          result[i].commentcount = result[i].comments.length;
          delete result[i].comments;
      }
      res.json(result);
    });
      });
  })

    
    .post(function (req, res){
      var title = req.body.title;
      if (!title){
        res.send('missing title');
      }
    MongoClient.connect(process.env.DB, function(err, client){
     if (err) throw err;
      
     var database = client.db('books');
      var doc = {title: title, comments:[]};
      database.collection('books').insert(doc, {w:1}, function(err, result){
        if (err){console.log('err')}
          console.log(result);
        res.json(result.ops[0]);
      });
    });
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client){
      if (err) throw err;
      
      var database = client.db('books');
      database.collection('books').remove();
      res.send('complete delete successful');
    });
    });




  app.route('/api/books/:id')
  .get(function (req, res){
    var bookid = req.params.id;
    //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    
   var oid = new ObjectId(bookid); //convert to mongo object id to search database
  
   MongoClient.connect(process.env.DB, function(err, client){
     if (err) throw err;
     
     var database = client.db('books');
     database.collection('books').find({_id: oid}).toArray(function(err, result){
     if (err) {console.log(err)};
       
       if (result.length == 0){
         res.send('no book exists');
       } else{
         res.json(result[0])
       }
     });
   });
  })
    
  .post(function(req, res){
    var bookid = req.params.id;
    var comment = req.body.comment;
    var oid = new ObjectId(bookid); //convert to mongo obj id 
    //json res format same as .get
  
  MongoClient.connect(process.env.DB, function(err, client){
  if (err) throw err;
    
    var database = client.db('books');
    database.collection('books').findAndModify(
      {_id: oid},
      {},
      {$push: {comments: comment}},
      {new: true, upsert: false},
      function(err, result){
        if (err) {console.log(err)};
        res.json(result.value);
      }
      );
  });
  })
    
  .delete(function(req, res){
    var bookid = req.params.id;
    var oid = new ObjectId(bookid); //convert to mongo obj id 
    //if successful response will be 'delete successful'
  MongoClient.connect(process.env.DB, function(err, client){
  if (err) throw err;
    var database = client.db('books');
    database.collection('books').findOneAndDelete({_id: oid}, function(err, result){
    if (err) {console.log(err)}
      res.send('delete successful');
    });
  });
  });
};
