import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import $ from 'jquery';


class FrontApp extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      username: '',
      icon: '',
      postList : [],
      friendList : [],
      commentList : [],
      cookieSet : false,
      inputUN : '',
      inputPW : '',
      inputComment: '',
    };

    // this.handleComment = this.handleComment.bind(this);
    // this.handleDeleteComment = this.handleDeleteComment.bind(this);
    // this.handleStar = this.handleStar.bind(this);
    // this.handleSignin = this.handleSignin.bind(this);
    this.inputUNChange = this.inputUNChange.bind(this);
    this.inputPWChange = this.inputPWChange.bind(this);
    this.inputCommentChange = this.inputCommentChange.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleDisplayInfo = this.handleDisplayInfo.bind(this);
    this.signin = this.signin.bind(this);
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

  handleLogout(){
    /* send logout request to server */
    this.setState({cookieSet: false});
  }

  handleDisplayInfo(){

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
              this.setState({
                username: data.name,
                icon: data.icon,
                friendList: data.friends,
                postList: data.posts,
                commentList: data.comments,
                cookieSet: true,
              });
              // alert(this.state.postList);
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
      // this.loadHome();
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
        <img id="barimg" src={this.props.icon} />
        <div id="barusername">{this.props.username}</div>
        <button id="barlogout" onClick={this.handleLogout}>Log out</button>
      </div>
    );
  }
}

class PostArea extends React.Component {
  constructor(props){
    super(props);
    this.handleComment = this.handleComment.bind(this);
    this.handleDelComment = this.handleDelComment.bind(this);
    this.handleStar = this.handleStar.bind(this);
    this.inputCommentChange = this.inputCommentChange.bind(this);
  }

  inputCommentChange(e){
    this.props.inputCommentChange(e.target.value);
  }
  handleStar(e){
    this.props.handleStar(e.target.value);
  }
  handleComment(e){
    this.props.handleComment(e);
  }
  handleDelComment(e){
    this.props.handleDelComment(e);
  }

  render(){
    // alert(this.props.posts);
    // alert(this.props.comments);
    var posts = this.props.posts;
    var comments = this.props.comments;

    for(var i=0;i<posts.length;i++){
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
}

class Post extends React.Component {
  constructor(props){
    super(props);
    this.handleComment = this.handleComment.bind();
    this.handleDelComment = this.handleDelComment.bind();
    this.handleStar = this.handleStar.bind();
  }
  handleComment(e){
    this.props.handleComment(e);
  }
  handleDelComment(e){
    this.props.handleDelComment(e);
  }
  handleStar(e){
    this.props.handleStar(e);
  }

  render(){
    var comment_list = [];
    // this.props.post.comments;
    this.props.post.comments.map((comment) => {
      comment_list.push(
        <p>{comment.time} {comment.name} said: {comment.content}</p>
      );
    });

    return (
      <div className="post">
        {this.props.post.name}<br/>
        {this.props.post.time}<br/>
        {this.props.post.location}<br/>
        {this.props.post.content}<br/>
        {this.props.post.icon}<br/>
        {comment_list}

      </div>
    );

  }
}

/* expose the App component to other modules */
export default FrontApp;


/*
temp_friends.map((friend) => {
  starredFriends.push(
    <li>{friend.name}</li>
  );
});
*/
