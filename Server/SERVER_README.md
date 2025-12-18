# Server Instructions
This is the backend server which transforms the Supabase database into an API. It requires the use of a .env file to hold sensitive database information and passwords. The server app can be run using:
`npm run dev` for the dev build
or
`npm run` for the stable build

# Important Note About Functionality
Attachments (photos) are not given when searching by post. This is because they are in a separate table.
That separate table has all attachments inside of it, and you can obtain all attachments for a certain post using a specific route.
When you obtain attachments that way, they will be sorted by which one was created first. You may want to use this to your advantage somehow, not sure.

# Packages Used:
* postgres / pg
* dotenv
* cors
* nodemon
**New Libraries**
* @google-cloud/storage (for... cloud storage..)
* multer (middleware for cloud storage)
* bcrypt (so that we don't store *unhashed* passwords in our database...)
* node-cache
* jsonwebtoken

### ALL OF THESE ROUTES EXCEPT FOR LOGIN / LOGOUT / CREATE USER REQUIRE AUTHORIZATION HEADER!
**HEADER FORMAT:**
authorization: "Bearer [TOKEN]"

# Routes
## ACCESS ROUTES
### /login
Attempts to login a user and add them to the session. Requires matching username and password
*Example JSON*
{
    'username':'some_username'
    'password':'some_password'
}

### /logout
Attempts to logout a user with the token provided in the authorization header

## GET ROUTES
### /users
Returns all users in the database, except users whose IDs are negative (test and admin accounts)

### /users/me
Returns the user that is _currently logged in_, so requires authentication.

### /users/:id
Returns the user with the id given, or an error

### /users/query?username=[name]
Finds all users with a username that starts with the value written in "name"

### /users/:user_id/posts
Returns all posts a user has made

### /posts
Returns all posts

### /posts/:id
Returns the post with the specified id, and all of it's comments

### /recent-posts/:num
Returns the 'num' most recent posts

### /hot-posts/:num
Returns the 'num' most liked posts

### /comments
Returns all comments

### /posts/:post_id/comments
Returns all comments on the specified post


## POST ROUTES
### /users
Adds a user to the database and returns the user created and a message with user id. The user will have to login after maing their account.
*EXAMPLE JSON:*
`{
    "username":"creative_username",
    "first_name":"firstname", 
    "last_name":"lastname",
    "email":"something@gmail.com", //MUST BE UNIQUE
    "role":0, //MUST BE -1, 0, 1 OR 2
    "display_name":"optionally something different",
    "biography":"optional biography",
    "password":"somethingSecure"
}`

*EXAMPLE RESPONSE:*
`{
    "user_id": "6",
    "body": "Created user with id: 6"
}`

### /posts
Adds a post to the database. Only works if a valid user id is given
*MULTIPART FORMAT*
**Format: Key -> Pair**
image -> (file)
text_content -> something witty
title -> fun title



### /posts/:post_id/comments
Adds a comment to the database under the post with id = post_id. Both the user id given in the body and the post id given in the request must be valid.
*EXAMPLE JSON*
`{
    "text_content":"A cool comment made by an admin"
}`

## PUT ROUTES
### /users/:id
Updates a user in the database. **NOTE THAT YOU MUST HAVE ALL FIELDS PRESENT FOR THIS TO WORK CORRECTLY!**
*Example JSON*
`{
    "username":"nomcrnative_username",
    "first_name":"dumb_firstname",
    "last_name":"dumb_lastname",
    "email":"something@new.com",
    "role":0,
    "display_name":"optionally something different",
    "biography":"optional biography",
    "reports":0
}`

### /posts/:id
Updates a post in the database. **ONLY WORKS FOR TEXT CONTENT AND TITLE**
*Example JSON*
`{
    "text_content":"example content",
    "title":"example title"
}`

### /posts/:post_id/comments/comment_id
Updates a comment in the database **ONLY WORKS FOR TEXT CONTENT**
*Example JSON*
`{
    "text_content":"example content"
}`


## DELETE ROUTES
### /users/:id
Deletes a user in the database. Know that this also deletes all posts, comments, attachments and reports the user makes.

### /posts/:id
Deletes a post in the database. Know that this also deletes all comments and attachments associated with that post.

### /comments/:id
Deletes a comment in the database.

### /posts/:post_id/comments/:comment_id
Deletes a comment in the database with post_id and comment_id

## LIKE AND DISLIKE ROUTES
THESE ARE ALL 'PUT' ROUTES
### /posts/:post_id/like
Attempts to like a post. If user has already liked post, removes the like. If user has disliked post, removes dislike and adds a like. If user has not interacted with the post before, adds a like. Requires user id to be handed over via json body.
*EXAMPLE JSON BODY:*
`{
    "user_id":-1
}`

### /posts/:post_id/dislike
Attempts to dislike post. Has same logic as above. Also requires a json body as shown above.

### /posts/:post_id/comment/:comment_id/like || dislike
Functions same as above, but for comments!

## REPORT ROUTES (all POST)
### /posts/:post_id/reports
Attempts to add a report to a post. Requires the user_id (until OAUTH is added) and a text_body.
*EXAMPLE JSON BODY:*
{
    "text_content":"This post is stupid!"
}

### /users/:user_id/reports
Attempts to add a report to a user. Same as above

### /comments/:comment_id/reports
Attempts to add a report to a comment. Same as above



## Tables

### Users
Fields:
id, username, first_name, last_name, display_name, email,
role (0=spectator, 1=gardener, 2=landscaper, -1=admin),
biography,
reports (# of times user has been reported)

### Posts
Fields:
id, user_id, username
title, text_content,
likes,
reports (# of times post has been reported)

### Comment and Post Likes (two separate tables)
Fields:
id, user_id, post/comment_id,
value (1 or -1)

### Comments
Fields:
id, user_id, post_id, username
created_at,
text_content,
reports (# of times comment has been reported)

### Reports
Fields:
id, user_id, target_id
type (0=user, 1=post, 2=comment),
text_content




