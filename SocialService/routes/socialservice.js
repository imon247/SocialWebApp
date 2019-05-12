var express = require('express');
var router = express.Router();

var Day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
var Month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var Day_ = {"Mon": 0, "Tue": 1, "Wed": 2, "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6};
var Month_ = {'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr':3, 'May':4, 'Jun':5, 'Jul':6, 'Aug':7, 'Sep':8, 'Oct':9, 'Nov':10, 'Dec':11};
router.post('/signin', function(req, res){
  var db = req.db;
  var userList = db.get('userList');
  var postList = db.get('postList');
  var commentList = db.get('commentList');
  res.set({
		"Access-Control-Allow-Origin": "http://localhost:3000",
	});
  var username = req.body.username;
  var password = req.body.password;
  var all_users = null;
  var all_posts = null;
  var all_comments = null;

  var user = null;
  var friends;
  var posts = [];
  var comments = [];
  var errorMsg = '';
  var found = false;

  userList.find({}, {}, function(err, docs){              /* get all users */
    if(err===null){
      all_users = docs;
      for(var i=0;i<all_users.length;i++){
        if(all_users[i].name===username && all_users[i].password===password){
          user = all_users[i];
          friends = all_users[i].friends;
          /* set cookie of the user */
          res.cookie('userId', user._id);
          console.log("set cookie succesfully: "+user._id);
          found = true;
        }
      }

    }
    else{
      res.send({msg: err});
    }
  }).then(function(){
    postList.aggregate([{$sort:{time: -1}}], function(err, docs){             /* get all posts */
      if(err===null){
        console.log("all posts:");
        console.log(docs);
        all_posts = docs;
      }
      else{
        res.send({msg: err});
      }
    });
  }).then(function(){
    commentList.aggregate([{$sort:{postTime: -1}}], function(err, docs){         /* get all comments */
      if(err===null){
        all_comments = docs;

        /* username and password match */
        if(found===true){
          /* modify the friends array to include name and icon */
          for(var i=0;i<friends.length;i++){
            for(var j=0;j<all_users.length;j++){
              if(friends[i].friendId == all_users[j]._id){
                friends[i].name = all_users[j].name;
                friends[i].icon = all_users[j].icon;
                break;
              }
            }
          }

          /* get posts of user's friend from all_posts */
          for(var i=0;i<all_posts.length;i++){
            for(var j=0;j<friends.length;j++){
              if(all_posts[i].userId == friends[j].friendId){
                var temp_post = all_posts[i];
                temp_post.name = friends[j].name;
                temp_post.icon = friends[j].icon;
                posts.push(temp_post);
                break;
              }
            }
          }
          // console.log(posts);

          /* get all comments of posts from all_comments */
          for(var i=0;i<all_comments.length;i++){
            for(var j=0;j<posts.length;j++){
              if(all_comments[i].postId == posts[j]._id && all_comments[i].deleteTime===''){
                comments.push(all_comments[i]);
                break;
              }
            }
          }

          for(var i=0;i<comments.length;i++){
            for(var j=0;j<all_users.length;j++){
              if(comments[i].userId == all_users[j]._id){
                comments[i].name = all_users[j].name;
              }
            }
          }


          console.log(user.name);
          console.log(user.icon);
          console.log("\n\n\n");
          console.log(friends);
          console.log("\n\n\n");
          console.log(posts);
          console.log("\n\n\n");
          console.log(comments);

          res.cookie("userId", user._id);
          res.send({
            userId: user._id,
            name: user.name,
            icon: user.icon,
            mobileNumber: user.mobileNumber,
            homeNumber: user.homeNumber,
            address: user.address,
            friends: friends,
            posts: posts,
            comments: comments,
          });
          console.log("home number is: "+user.homeNumber);

        }
        else{
          console.log("not found!!!!!!");
          res.send({msg:''});
        }


      }
      else{
        res.send({msg: err});
      }
    });
  });
});


router.get('/logout/:userid', function(req, res){
  var db = req.db;
  var userList = db.get('userList');
  res.set({"Access-Control-Allow-Origin": "http://localhost:3000"});
  res.cookie('userId', '');
  console.log("the cookie variable is: "+req.params.userid);
  userList.update({"_id": req.cookies['userId']},
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
  var filter = {"_id": userId};
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
  res.set({"Access-Control-Allow-Origin": "http://localhost:3000",});
  var userId = req.body.userId;
  console.log("cookie is: "+ userId);
  var newMobileNumber = req.body.newMobileNumber;
  var newHomeNumber = req.body.newHomeNumber;
  var newAddress = req.body.newAddress;

  var filter = {"_id": userId};
  userList.update(filter,
                  {$set:
                    {"mobileNumber":newMobileNumber, "homeNumber":newHomeNumber, "address":newAddress}
                  },
                  function(err, result){
                    res.send((err === null) ? { msg: '' } : { msg: err });
                  });

  });

router.post('/updatestar/:friendid', function(req, res){
  var db = req.db;
  var userList = db.get('userList');
  var contactToUpdate = req.params.friendid;
  res.set({
      "Access-Control-Allow-Origin": "http://localhost:3000",
  });

  console.log("friend is: "+req.params.friendid);
  console.log("userId is: "+req.body.userId);
  var targetFriend = req.params.friendid;
  var filter = {"_id": req.body.userId};
  var friends;
  userList.findOne(filter, {}, function(err, docs){
    if(err===null){
      friends = docs.friends;
      for(var i=0;i<friends.length;i++){
        if(friends[i].friendId===targetFriend){
          if(friends[i].starredOrNot==='Y'){
            friends[i].starredOrNot = 'N';
          }
          else{
            friends[i].starredOrNot = 'Y';
          }
          break;
        }
      }
      userList.update(filter,
                      {$set: {"friends": friends}},
                      function(err, result){
                        res.send((err===null) ? {msg: ''} : {msg: err});
                      });
    }
    else{
      console.log("there is an error!");
      res.send({msg: err});
    }
  });
});

router.post('/postcomment/:postid', function(req,res){
  var db = req.db;
  var commentList = db.get('commentList');
  var userId = req.body.userId;
  var name = req.body.name;
  var postId = req.params.postid;
  var content = req.body.content;
  var postTime = new Date();
  res.set({
      "Access-Control-Allow-Origin": "http://localhost:3000",
  });
  var comment = {
    "postId": postId,
    "userId": userId,
    "postTime": postTime.getHours()+':'+postTime.getMinutes()+':'+postTime.getSeconds()+' ' + Day[postTime.getDay()] + ' ' + Month[postTime.getMonth()] + ' ' + postTime.getDate() + ' ' +postTime.getFullYear(),
    "content": content,
    "deleteTime": '',
  };

  commentList.insert(comment, function(err, result){
    if(err===null){
      console.log(result);
      result.name = name
      res.send({msg:'', result: result});
    }
    else{
      res.send({msg: err});
    }
  });
});


router.delete('/deletecomment/:commentid', function(req, res){
  var db = req.db;
  var commentList = db.get('commentList');
  // var userId = req.cookies['userId'];
  var filter = {"_id": req.params.commentid};
  res.set({"Access-Control-Allow-Origin": "http://localhost:3000"});
  var time = new Date();
  var time = time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()+' ' + Day[time.getDay()] + ' ' + Month[time.getMonth()] + ' ' + time.getDate() + ' ' +time.getFullYear();
  commentList.update(filter,
                     {$set: {"deleteTime": time}},
                     function(err, result){
                       res.send((err===null) ? {msg: ''} : {msg: err});
                     }
                    );
});


router.get('/loadcommentupdates/:userid', function(req, res){
  var db = req.db;
  var commentList = db.get('commentList');
  var userList = db.get('userList');
  var postList = db.get('postList');

  res.set({
      "Access-Control-Allow-Origin": "http://localhost:3000",
  });

  var friends = [];
  var comments = [];
  var lastCommentRetrievalTime;
  var filter = {"_id": req.params.userid};
  userList.findOne(filter, {}, function(err, docs){
    if(err===null){
      console.log("!!!!!!!!:"+docs.friends);
      friends = docs.friends;
      lastCommentRetrievalTime = docs.lastCommentRetrievalTime;
    }
    else{
      res.send({msg: err});
    }
  }).then(function(){
    commentList.find({}, {}, function(err, docs){
      if(err===null){
        var all_comments = docs;
        for(var i=0;i<all_comments.length;i++){
          for(var j=0;j<friends.length;j++){
            var temp = compareTime(all_comments[i].postTime,lastCommentRetrievalTime) || compareTime(all_comments[i].deleteTime, lastCommentRetrievalTime);
            if(all_comments[i].userId==friends[j].friendId && temp){
              comments.push(all_comments[i]);
              break;
            }
          }
        }
        /* update the last comment retrieval time */
        var time = new Date();
        var time = time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()+' ' + Day[time.getDay()] + ' ' + Month[time.getMonth()] + ' ' + time.getDate() + ' ' +time.getFullYear();

        userList.update(filter,
                        {$set: {"lastCommentRetrievalTime": time}},
                        function(err, result){
                          if(err===null){
                            console.log(comments);
                            res.send({comments: comments});
                          }
                          else{
                            res.send({msg: err});
                          }
                        });

      }
      else{
        res.send({msg: err});
      }
    })
  });
});

function compareTime(t1, t2){
  var t1 = t1.split();
  var t2 = t2.split();
  var y1 = t1[4];
  var y2 = t2[4];
  if(y1>y2){
    console.log(y1, y2);
    return true;
  }
  else if(Month_[t1[2]]>Month_[t2[2]]){
    console.log("true2!");
    return true;
  }
  else if(t1[3]> t2[3]){
    console.log(t1[3], t2[3]);
    return true;
  }
  else if(t1[0].split(':')[0] > t2[0].split(':')[0]){
    console.log("true!3");
    return true;
  }
  else if(t1[0].split(':')[1] > t2[0].split(':')[1]){
    console.log("true!4");
    return true;
  }
  else if(t1[0].split(':')[2] > t2[0].split(':')[2]){
    console.log("true!5");
    return true;
  }

  return false;

}





/* handle preflighted request */
router.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.send(200);
});

module.exports = router;
