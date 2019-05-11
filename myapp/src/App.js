import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import $ from 'jquery';
import Cookies from 'js-cookie';

class FrontApp extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      userId: '',
      username: '',
      icon: '',
      mobileNumber: '',
      homeNumber: '',
      address: '',
      postList : [],
      friendList : [],
      commentList : [],
      cookieSet : false,
      inputUN : '',
      inputPW : '',
      inputComment: '',
      rightDivision: "posts",
    };

    this.handleComment = this.handleComment.bind(this);
    // this.handleDeleteComment = this.handleDeleteComment.bind(this);
    this.inputUNChange = this.inputUNChange.bind(this);
    this.inputPWChange = this.inputPWChange.bind(this);
    this.inputCommentChange = this.inputCommentChange.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleDisplayInfo = this.handleDisplayInfo.bind(this);
    this.handleStar = this.handleStar.bind(this);
    this.signin = this.signin.bind(this);
    this.finishUpdate = this.finishUpdate.bind(this);
  }

  loadHome(){

  }

  inputUNChange(username){
    this.setState({inputUN: username});
  }

  inputPWChange(password){
    this.setState({inputPW: password});
  }

  inputCommentChange(comment){
    this.setState({inputComment: comment});
  }
  handleDisplayInfo(e){
    this.setState({rightDivision: "info"});
  }

  handleLogout(){
    /* send logout request to server */
    this.setState({
      userId: '',
      username: '',
      icon: '',
      mobileNumber: '',
      homeNumber: '',
      address: '',
      postList : [],
      friendList : [],
      commentList : [],
      cookieSet : false,
      inputUN : '',
      inputPW : '',
      inputComment: '',
      rightDivision: "posts",
    });
  }

  finishUpdate(newMobileNumber, newHomeNumber, newAddress){
    this.setState({rightDivision: "posts",
                   mobileNumber: newMobileNumber,
                   homeNumber: newHomeNumber,
                   address: newAddress
                 });
  }

  handleComment(postId, comment){
      // alert(comment);
      $.post("http://localhost:3001/socialservice/postcomment/"+postId,
            {
              "name": this.state.username,
              "userId": this.state.userId,
              "postid": this.state.postid,
              "comment": comment,
            },
            function(data, status){
              if(data.msg===''){
                alert("success!");
              }
              else{
                alert("fail!");
              }
            });
  }

  handleStar(friendId){
    // alert(friendId);
    $.ajax({
      type: 'POST',
      url: "http://localhost:3001/socialservice/updatestar/"+friendId,
      data: {
        "userId": this.state.userId
      },
      dataType: 'json',
      success: function(data){
        var friends = this.state.friendList;
        for(var i=0;i<friends.length;i++){
          if(friends[i].friendId==friendId){
            if(friends[i].starredOrNot=='Y'){
              friends[i].starredOrNot = 'N';
            }
            else{
              friends[i].starredOrNot = 'Y';
            }
            break;
          }
        }
        this.setState({friendList: friends});
      }.bind(this),
      error: function(xhr, ajaxOptions, thrownError){
        alert(xhr.status);
        alert(thrownError);
      }.bind(this)
    });
  }

  signin(e){
    e.preventDefault();
    var username = this.state.inputUN;
    var password = this.state.inputPW;
    if(username==='' || password===''){
      alert("Please fill in all fields!");
    }
    else{
      $.post("http://localhost:3001/socialservice/signin",
            {
              "username": username,
              "password": password,
            },
            function(data,status){
              if(data.msg===''){
                this.setState({cookieSet: false});
                alert("login failure: please enter valid username and password");
              }
              else{

                this.setState({
                  username: data.name,
                  icon: data.icon,
                  mobileNumber: data.mobileNumber,
                  homeNumber: data.homeNumber,
                  address: data.address,
                  friendList: data.friends,
                  postList: data.posts,
                  commentList: data.comments,
                  userId: data.userId,
                  cookieSet: true,
                });
              }
            }.bind(this));
    }
  }

  render(){
    if(this.state.cookieSet===false){
      return (
        <div id="wrapper">
          <h2>MyApp</h2>
          <SigninForm
            inputUN = {this.state.inputUN}
            inputPW = {this.state.inputPW}
            onUNChange = {this.inputUNChange}
            onPWChange = {this.inputPWChange}
            signin = {this.signin}
          />
        </div>
      );
    }
    else{
      return(
        <div id="wrapper">
          <h2>MyApp</h2>
          <InfoBar
            username = {this.state.username}
            icon = {this.state.icon}
            handleLogout = {this.handleLogout}
            handleDisplayInfo = {this.handleDisplayInfo}
          />
          <StarredFriends
            friends = {this.state.friendList}
          />
          <PostArea
            inputCommentChange = {this.inputCommentChange}
            handleStar = {this.handleStar}
            handleComment = {this.handleComment}
            handleDelComment = {this.handleDelComment}
            comments = {this.state.commentList}
            posts = {this.state.postList}
            friends = {this.state.friendList}
            postOrInfo = {this.state.rightDivision}
            userId = {this.state.userId}
            icon = {this.state.icon}
            name = {this.state.username}
            mobileNumber = {this.state.mobileNumber}
            homeNumber = {this.state.homeNumber}
            address = {this.state.address}
            finishUpdate = {this.finishUpdate}
          />
        </div>
      );
    }
  }
}

class SigninForm extends React.Component {
  constructor(props){
    super(props);
    this.inputUNChange = this.inputUNChange.bind(this);
    this.inputPWChange = this.inputPWChange.bind(this);
    this.signin = this.signin.bind(this);
  }

  inputUNChange(e){
    this.props.onUNChange(e.target.value);
  }

  inputPWChange(e){
    this.props.onPWChange(e.target.value);
  }

  signin(e){
    this.props.signin(e);
  }

  render(){
    return(
      <div>
      <form>
        Username: <input type="text"
                         value={this.props.inputUN}
                         onChange={this.inputUNChange}
                         /><br/>
        Password: <input type="password"
                         value={this.props.inputPW}
                         onChange={this.inputPWChange}
                         /><br/>
        <button onClick={this.signin}>Sign in</button>
      </form>
      </div>
    );
  }
}

class StarredFriends extends React.Component {
  constructor(props){
    super(props);
    // this.starFriendChange = this.starFriendChange.bind(this);
  }

  render(){
    let starredFriends = [];
    var temp_friends = [];
    for(var i=0;i<this.props.friends.length;i++){
      if(this.props.friends[i].starredOrNot==='Y'){
        temp_friends.push(this.props.friends[i]);
      }
    }
    temp_friends.map((friend) => {
      starredFriends.push(
        <li>{friend.name}</li>
      );
    });
    return (
      <div id="starredFriends">
        <ul>
          {starredFriends}
        </ul>
      </div>
    );
  }
}

class InfoBar extends React.Component {
  constructor(props){
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleDisplayInfo = this.handleDisplayInfo.bind(this);
  }

  handleLogout(e){
    this.props.handleLogout(e);
  }

  handleDisplayInfo(e){
    this.props.handleDisplayInfo(e);
  }
  render(){
    return(
      <div id="bar">
        <div id="info" onClick={this.handleDisplayInfo}>
          <img id="barimg" src={this.props.icon} />
          <div id="barusername">{this.props.username}</div>
        </div>
        <button id="barlogout" onClick={this.handleLogout}>Log out</button>
      </div>
    );
  }
}

class PostArea extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      inputMN: this.props.mobileNumber,
      inputHN: this.props.homeNumber,
      inputADDR: this.props.address,
      friendList: this.props.friends,
      posts: [],
    };

    this.handleComment = this.handleComment.bind(this);
    this.handleDelComment = this.handleDelComment.bind(this);
    this.handleStar = this.handleStar.bind(this);
    this.inputCommentChange = this.inputCommentChange.bind(this);
    this.saveInfo = this.saveInfo.bind(this);
    this.inputMNChange = this.inputMNChange.bind(this);
    this.inputHNChange = this.inputHNChange.bind(this);
    this.inputADDRChange = this.inputADDRChange.bind(this);
  }

  inputCommentChange(e){
    this.props.inputCommentChange(e.target.value);
  }
  handleStar(friendId){
    this.props.handleStar(friendId);
  }
  handleComment(postId, comment){
    this.props.handleComment(postId, comment);
  }
  handleDelComment(postId, comment){
    this.props.handleDelComment(postId, comment);
  }
  saveInfo(e){
    e.preventDefault();
    // alert(Cookies.get('userId'));
    var newMobileNumber = this.state.inputMN;
    var newHomeNumber = this.state.inputHN;
    var newAddress = this.state.inputADDR;

    $.post("http://localhost:3001/socialservice/saveuserprofile",
            {
              "newMobileNumber": newMobileNumber,
              "newHomeNumber": newHomeNumber,
              "newAddress": newAddress,
              "userId": this.props.userId
            },
            function(data, status){
              if(data.msg!=''){
                alert("error setting profile!");
              }
              else{
                this.props.finishUpdate(newMobileNumber, newHomeNumber, newAddress);
              }
            }.bind(this)
          );


  }
  inputMNChange(e){
    this.setState({inputMN: e.target.value});
  }
  inputHNChange(e){
    this.setState({inputHN: e.target.value});
  }
  inputADDRChange(e){
    this.setState({inputADDR: e.target.value});
  }
  render(){
    if(this.props.postOrInfo=="posts"){
      var posts = this.props.posts;
      var comments = this.props.comments;
      for(var i=0;i<posts.length;i++){
        for(var j=0;j<this.state.friendList.length;j++){
          if(posts[i].userId == this.state.friendList[j].friendId){
            posts[i].starred = this.state.friendList[j].starredOrNot;
            break;
          }
        }
        posts[i].comments = [];
      }

      for(var i=0;i<comments.length;i++){
        for(var j=0;j<posts.length;j++){
          if(comments[i].postId == posts[j]._id){
            posts[j].comments.push(comments[i]);
          }
        }
      }


      let temp_posts = [];
      posts.map((post) => {
        temp_posts.push(
          <Post
            post = {post}
            handleComment = {this.handleComment}
            handleDelComment = {this.handleDelComment}
            handleStar = {this.handleStar}
          />
        );
      });

      return(
        <div>
          {temp_posts}
        </div>
      )
    }
    else{
      return(
        <div>
          <div>
            <img src={this.props.icon}></img>
            <span>{this.props.name}</span>
          </div>
          <form>
            Mobile number:<input type="text" value={this.state.inputMN} onChange={this.inputMNChange}></input><br/>
            Home number:<input type="text" value={this.state.inputHN} onChange={this.inputHNChange}></input><br/>
            Mailing address:<input type="text" value={this.state.inputADDR} onChange={this.inputADDRChange}></input><br/>
            <button onClick={this.saveInfo}>Save</button>
          </form>
        </div>
      )
    }
  }
}

class Post extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      inputComment: '',
    };

    this.handleComment = this.handleComment.bind(this);
    this.handleDelComment = this.handleDelComment.bind(this);
    this.handleStar = this.handleStar.bind(this);
    this.inputCommentChange = this.inputCommentChange.bind(this);
  }
  handleComment(e){
    // alert(this.props.post._id + "  " + this.state.inputComment);
    e.preventDefault();
    this.props.handleComment(this.props.post._id, this.state.inputComment);
  }
  handleDelComment(e){
    this.props.handleDelComment(e);
  }
  handleStar(e){
    this.props.handleStar(this.props.post.userId);
  }
  inputCommentChange(e){
    this.setState({inputComment: e.target.value});
  }
  render(){
    var comment_list = [];
    // this.props.post.comments;
    this.props.post.comments.map((comment) => {
      comment_list.push(
        <p>{comment.postTime} {comment.name} said: {comment.content}</p>
      );
    });
    if(this.props.post.starred=='Y'){
      var imgpath = "icons/star_filled.png";
    }
    else{
      var imgpath = "icons/star_empty.png";
    }

    return (
      <div className="post">
        {this.props.post.name}<br/>
        <img src={imgpath} onClick={this.handleStar} rel={this.props.post.userId}></img><br/>
        {this.props.post.time}<br/>
        {this.props.post.location}<br/>
        {this.props.post.content}<br/>
        {this.props.post.icon}<br/>
        {comment_list}
        <input placeholder="Enter your comment here" type="text" value={this.state.inputComment} rel={this.props.post._id} onChange={this.inputCommentChange}></input>
        <button onClick={this.handleComment}>submit</button><br/><br/>
      </div>
    );

  }
}

/* expose the App component to other modules */
export default FrontApp;
