# Server Instructions
This is the backend server which transforms the Supabase database into an API. It requires the use of a .env file to hold sensitive database information and passwords. The server app can be run using:
`npm run dev` for the dev build
or
`npm run` for the stable build

# Important Note About Functionality
Attachments (photos) are not given when searching by post. This is because they are in a separate table.
That separate table has all attachments inside of it, and you can obtain all attachments for a certain post using a specific route.
When you obtain attachments that way, they will be sorted by which one was created first. You may want to use this to your advantage somehow, not sure.

# Routes
## GET ROUTES
### /users
Returns all users in the database, except users whose IDs are negative (test and admin accounts)

### /users/:id
Returns the user with the id given, or an error

### /users/query?username=[name]
Finds all users with a username that starts with the value written in "name"

### /users/:user_id/posts
Returns all posts a user has made

### /posts
Returns all posts

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
Adds a user to the database and returns the user created and a little message
*EXAMPLE JSON:*
`{
    "username":"creative_username",
    "first_name":"firstname", 
    "last_name":"lastname",
    "email":"something@gmail.com", //MUST BE UNIQUE
    "role":0, //MUST BE -1, 0, 1 OR 2
    "display_name":"optionally something different",
    "biography":"optional biography",
    "reports":0 //I would recommend not setting this since it is how many reports a user has recieved
}`

*EXAMPLE RESPONSE:*
`{
    "user_id": "6",
    "body": "Created user with id: 6"
}`

### /posts
Adds a post to the database. Only works if a valid user id is given
*EXAMPLE JSON*
`{
    "user_id":-1, 
    "title":"A cool post made by an admin",
    "text_content":"Some cool text content"
}`

### /posts/:post_id/comments
Adds a comment to the database under the post with id = post_id. Both the user id given in the body and the post id given in the request must be valid.
*EXAMPLE JSON*
`{
    "user_id":-1,
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




## Tables

### Users
Fields:
id, username, first_name, last_name, display_name, email,
role (0=spectator, 1=gardener, 2=landscaper, -1=admin),
biography,
reports (# of times user has been reported)

### Posts
Fields:
id, user_id,
title, text_content,
likes,
reports (# of times post has been reported)

### Comment and Post Likes (two separate tables)
Fields:
id, user_id, post/comment_id,
value (1 or -1)

### Comments
Fields:
id, user_id, post_id,
created_at,
text_content,
reports (# of times comment has been reported)

### Attachments
Fields:
id, user_id, post_id,
created_at,
attachment_link

### Reports
Fields:
id, user_id, target_id
type (0=user, 1=post, 2=comment),
text_content




