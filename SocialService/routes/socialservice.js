var express = require('express');
var router = express.Router();

/* handle preflighted request */
router.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.send(200);
});

router.post('/signin', function(req, res){
  var db = req.db;
  var userList = db.get('userList');
  var postList = db.get('postList');
  var commentList = db.get('commentList');
  res.set({
		"Access-Control-Allow-Origin": "http://localhost:3000",
	});
  var username = req.body.name;
  var password = req.body.password;
  // var index;
  var filter = {"name": username, "password": password};
  userList.findOne(filter, {}, function(err, result){
    if(err===null){
      if(result.length>0){                // username and password match
        res.cookie('userId', result._id.str);
        var name = result.name;
        var icon = result.icon;
        var friends = result.friends;
        var posts = [];
        var comments = [];


        /* get friends of this user */
        for(var i=0;i<friends.length;i++){
          var friend_record = userList.findOne({"_id": ObjectId(friends[i].friendId)});
          friends[i].icon = friend_record.icon;
          friends[i].name = friend_record.name;
        }

        /* get all posts from friends of this user */
        for(var i=0;i<friends.length;i++){
          var postsOfHis = postList.find({"userId": friends[i].friendId});
          for(var j=0;j<postsOfHis.length;j++){
            posts.push({
              "_id": postsOfHis[j]._id.str,
              "userId": postsOfHis[j].userId,
              "time": postsOfHis[j].time,
              "location": postsOfHis[j].location,
              "content": postsOfHis[j].content,
            });
          }
        }

        /* get all comments of posts from friends of this user */
        for(var i=0;i<posts.length;i++){
          var commentOfPost = commentList.find({"postId": posts[i]._id});
          for(var j=0;j<commentOfPost.length;j++){
            if(commentOfPost[j].deleteTime===''){
              comments.push({
                "_id": commentOfPost[j]._id.str,
                "postId": commentOfPost[j].postId,
                "commentedBy": userList.findOne({"_id": ObjectId(commentOfPost[j].userId)}).name,
                "postTime": commentOfPost[j].postTime,
                "content": commentOfPost[j].content,
              });
            }
          }
        }

        /* set the lastCommentRetrievalTime */
        var d = new Date();
        var time = d.getHours()+':'+d.getMinutes()+' '+d.getDay()+' '+d.getMonth()+' '+d.getDate()+' '+d.getFullYear();
        userList.update({"_id": result._id},
                        { $set: {
                                  "lastCommentRetrievalTime": time
                                }
                        });

        /* send all information to client */
        res.send({
          name: name,
          icon: icon,
          friends: friends,
          posts: posts,
          comments: comments
        });

      }
      else{                               // username and password do not match
        res.send({msg: "Login failure"});
      }
    }
    else{                                 // DB failure
      res.send({msg: err});
    }
  });
});


router.get('/logout', function(req, res){
  var db = req.db;
  var userList = db.get('userList');
  res.set({"Access-Control-Allow-Origin": "http://localhost:3000"});
  res.cookie('userId', '');
  userList.update({"_id": req.params.id},
                  {$set: {"lastCommentRetrievalTime": ''}},
                  function(err, result){
                      res.send((err === null) ? { msg: '' } : { msg: err });
                  });
});

router.get('/getuserprofile', function(req, res){
  var db = req.db;
  var userList = db.get('userList');
  res.set({"Access-Control-Allow-Origin": "http://localhost:3000"});
  var userId = req.cookies['userId'];
  var filter = {"_id": ObjectId(userId)};
  userList.findOne(filter, {}, function(err, result){
    if(err===null){
      res.send({
        mobileNumber: result.mobileNumber,
        homeNumber: result.homeNumber,
        address: result.address
      });
    }
    else{
      res.send({msg: err});
    }
  });
});

router.put('/saveuserprofile', function(req, res){
  var db = req.db;
  var userList = db.get('userList');
  res.set({"Access-Control-Allow-Origin": "http://localhost:3000"});
  var userId = req.cookies['userId'];
  var newMobileNumber = req.body.mobileNumber;
  var newHomeNumber = req.body.homeNumber;
  var newAddress = req.body.address;

  var filter = {"_id": ObjectId(userId)};
  userList.update(filter,
                  {$set:
                    {"mobileNumber":newMobileNumber, "homeNumber":newHomeNumber, "address":newAddress}
                  },
                  function(err, result){
                    res.send((err === null) ? { msg: '' } : { msg: err });
                  });
  });

router.get('/updatestar/:friendid', function(req, res){
  var db = req.db;
  var userList = db.get('userList');
  var contactToUpdate = req.params.friendid;
  res.set({
      "Access-Control-Allow-Origin": "http://localhost:3000",
  });

  var filter = {"_id": ObjectId(req.cookies['userId'])};
  var friends = userList.findOne(filter).friends;
  if(friends===null){
    res.send({msg: "unable to find user!"});
    return;
  }

  var index = -1;
  for(var i=0;i<friends.length;i++){
    if(friends[i].friendId === contactToUpdate){
      index = i;
      var previousStatus = friends[index].starredOrNot;
      if(previousStatus==='Y'){ friends[index].starredOrNot = 'N'; }
      else{ friends[index].starredOrNot = 'Y'; }
      break;
    }
  }
  if(index===-1){
    res.send({msg: "unable to find friend ID!"});
    return;
  }

  userList.update(filter,
                  {
                    $set: {"friends": friends}
                  },
                  function(err, result){
                    res.send((err===null) ? {msg: ''} : {msg: err});
                  });
});

router.post('/postcomment/:postid', function(req, res){
  var db = req.db;
  var commentList = db.get('commentList');
  var userId = req.cookies['userId'];
  var postId = req.params.postid;
  var content = req.body.comment;
  var postTime = new Date();

  var comment = {
    "postId": postId,
    "userId": userId,
    "postTime": postTime,
    "content": content,
    "deleteTime": '',
  };
  commentList.insert(comment, function(err, result){
    res.send((err===null) ? {msg: ''} : {msg: err});
  });
});

router.delete('/deletecomment/:commentid', function(req, res){
  var db = req.db;
  var commentList = db.get('commentList');
  // var userId = req.cookies['userId'];
  var filter = {"_id": ObjectId(req.params.commentid)};
  commentList.update(filter,
                     {$set: {"deleteTime": new Date()}},
                     function(err, result){
                       res.send((err===null) ? {msg: ''} : {msg: err});
                     }
                    );
});

router.get('/loadcommentupdates', function(req, res){
  var db = req.db;
  var commentList = db.get('commentList');
  var userList = db.get('userList');
  var postList = db.get('postList');

  // var newComments = [];
  var target_user = userList.findOne({"_id": ObjectId(req.cookies['userId'])});
  var lastCommentRetrievalTime = target_user.lastCommentRetrievalTime;
  var friends = target_user.friends;
  var post_ids = [];
  for(var i=0;i<friends.length;i++){
    var postsOfHis = postList.find({"userId": friends[i].friendId});
    for(var j=0;j<postsOfHis.length;j++){
        post_ids.push(postsOfHis[j]._id.str);
    }
  }

  var newComments = [];
  var deletedComments = [];
  for(var i=0;i<post_ids.length;i++){
    var comments_of_post = commentList.find({"postId": post_ids[i]});
    for(var j=0;j<comments_of_post.length;j++){
      if(comments_of_post[i].postTime > lastCommentRetrievalTime){
        if(comments_of_post[i].deleteTime === ''){
          newComments.push(comments_of_post[j]);
        }
        else{
          deletedComments.push(comments_of_post[j]._id.str);
        }
      }
    }
  }

  userList.update({"_id": ObjectId(req.cookies['userId'])}, {$set: {"lastCommentRetrievalTime": new Date()}});

  res.send({newComments: newComments,
            deletedComments: deletedComments});
});

module.exports = router;
