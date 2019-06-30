This is a social-networking web application. By using this web application, you can see friends' posts and post your own comment. 

You have your own account. After logging onto your account, you will see a list of posts posted by friends. Also, you can star a friend and he/she will appear in the starred-friends list. 

However unfortunately, the cookie does not work on the server side. Hence it is unable to send the cookie back to the client. To fix this problem, I change some methods so that userId is carried as data in the request body.