# Server Instructions
This is the backend server which transforms the Supabase database into an API. It requires the use of a .env file to hold sensitive database information and passwords. The server app can be run using:
`npm run dev` for the dev build
or
`npm run` for the stable build

## Routes


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

### Likes
Fields:
id, user_id, post_id,
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




