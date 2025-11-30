import express from 'express'
import cors from 'cors'

import 'dotenv/config' //This will pull in the .env file


import { query } from './util/postgres.js'

const DB_PORT = process.env.DB_PORT

const app = express()

app.set('port', DB_PORT)

app.use(express.json())
app.use(cors())

/** GET ROUTES */

// a simple route used to determine whether the server is running or not
app.get('/up', (_req, res) => {
    res.json({status: "up"})
})

// default
app.get('/', (_req, res) => {
    res.send("Welcome to the GYG API!")
})

// get all users excluding test and admin accounts (whose ids are less than 0)
app.get('/users', (req, res) => {
    const qs = `SELECT * FROM Users WHERE id>0`
    try {
        query(qs).then(data => {res.json(data.rows)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// get user with a specific username (with wildcard)
// example call: query?username=Bill
// Would find billy, billon, billtoven etc.
app.get('/users/query', (req, res) => {
    const target = req.query.username + "%" || '%'
    

    const qs = `SELECT * FROM Users WHERE username LIKE $1 AND id>0`
    const params = [target]

    try {
        query(qs, params).then(data => {res.json(data.rows)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// get user with specified id (including test and admin accounts if requested)
app.get('/users/:id', (req, res) => {
    const qs = `SELECT * FROM Users WHERE id=$1`
    const params = [req.params.id]
    try {
        query(qs, params).then(data => {res.json(data.rows)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// get all posts made by a particular userid
app.get('/users/:user_id/posts', (req, res) => {
    const user_id = req.params.user_id

    const qs = `SELECT * FROM Posts WHERE user_id=$1`
    const params = [user_id]
    try {
        query(qs, params).then(data => {res.json(data.rows)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})


// get all posts
app.get('/posts', (_req, res) => {
    const qs = `SELECT * FROM Posts`
    try {
        query(qs).then(data => {res.json(data.rows)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

//get top {num} recent posts
app.get('/recent-posts/:num', (req, res) => {
    const num = req.params.num

    const params = [num]
    const qs = `SELECT * FROM Posts ORDER BY created_at DESC LIMIT $1`
    try {
        query(qs, params).then(data => {res.json(data.rows)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

//get top {num} liked posts
app.get('/hot-posts/:num', (req, res) => {
    const num = req.params.num

    const params = [num]
    const qs = `SELECT * FROM Posts ORDER BY likes DESC LIMIT $1`
    try {
        query(qs, params).then(data => {res.json(data.rows)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// get all comments
app.get('/comments', (_req, res) => {
    const qs = `SELECT * FROM comments`
    try {
        query(qs).then(data => res.json(data.rows))
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// get all comments on a particular post
app.get('/posts/:post_id/comments', (req, res) => {
    const post_id = req.params.post_id

    const params = [post_id]
    const qs = `SELECT * FROM comments WHERE post_id=$1`
    try {
        query(qs, params).then(data => res.json(data.rows))
    } catch (error) {
        res.status(400).json(error.message)
    }
})

/** POST ROUTES */

// create a new user with desired fields, note that a user cannot be created with the same email as another user
app.post('/users', (req, res) => {
    const body = req.body

    const username = body["username"] || null
    const first_name = body["first_name"] || null
    const last_name = body["last_name"] || null
    const email = body["email"] || null
    const role = body["role"] || 0
    const biography = body["biography"] || null
    const reports = body["reports"] || 0
    const display_name = body["display_name"] || first_name + ' ' + last_name || null

    if (role > 2) {
        res.status(400).json("Invalid role given.")
    }

    const params = [username, first_name, last_name, email, role, biography, reports, display_name]

    const qs = `INSERT INTO Users 
                (username, first_name, last_name, email, role, biography, reports, display_name)
                values ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`

    try {
        query(qs, params).then(data => {res.json({user_id:data.rows[0].id, body:`Created user with id: ${data.rows[0].id}`})})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// create a new post with desired fields. Note that user ID must be a valid user
app.post('/posts', (req, res) => {
    const body = req.body

    const user_id = body["user_id"] || null
    const text_content = body["text_content"] || null
    const title = body["title"] || null

    const reports = 0; const likes = 0; //no likes or reports by default... obviously...

    const params = [user_id, text_content, title, reports, likes]
    const qs = `INSERT INTO Posts (user_id, text_content, title, reports, likes) VALUES ($1, $2, $3, $4, $5)`

    try {
        query(qs, params).then(data => {res.json(`Created ${data.rowCount} new posts under user ${body.user_id}`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// create a new comment with the desired fields. Note that user and post ids must be valid
app.post('/posts/:post_id/comments', (req, res) => {
    const body = req.body
    const user_id = body["user_id"] || null; const post_id = req.params.post_id;
    const text_content = body["text_content"] || null
    const reports = 0; const likes = 0;

    const params = [user_id, post_id, text_content, reports, likes]
    const qs = `INSERT INTO comments (user_id, post_id, text_content, reports, likes) VALUES ($1, $2, $3, $4, $5)`

    try {
        query(qs, params).then(data => {res.json(`Created ${data.rowCount} new comments under user ${body.user_id}` )})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

/** PUT ROUTES */

// update a user
app.put('/users/:id', (req, res) => {
    const body = req.body
    const id = req.params.id

    const username = body["username"] || null
    const first_name = body["first_name"] || null
    const last_name = body["last_name"] || null
    const email = body["email"] || null
    const role = body["role"] || 0
    const biography = body["biography"] || null
    const reports = body["reports"] || 0
    const display_name = body["display_name"] || first_name + ' ' + last_name || null

    if (role > 2) {
        res.status(400).json("Invalid role given.")
    }

    const params = [username, first_name, last_name, email, role, biography, reports, display_name, id]

    const qs = `UPDATE Users set username=$1, first_name = $2, last_name=$3, email=$4, role=$5, biography=$6, reports=$7, display_name=$8 WHERE id=$9`

    try {
        query(qs, params).then(data => {res.json(`Number of users updated:${data.rowCount}`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// edit an existing post. Note that you can only change the title and text content through this method. Anything else requires admin console or alternative command
app.put('/posts/:id', (req, res) => {
    const body = req.body
    const id = req.params.id

    const text_content = body["text_content"] || null
    const title = body["title"] || null

    const params = [text_content, title, id]
    const qs = `UPDATE Posts set text_content=$1, title=$2 WHERE id=$3`

    try {
        query(qs, params).then(data => {res.json(`Updated ${data.rowCount} posts`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// edit an existing comment
app.put('/posts/:post_id/comments/:comment_id', (req, res) => {
    const body = req.body
    const post_id = req.params.post_id
    const comment_id = req.params.comment_id
    
    const text_content = body["text_content"] || null

    const params = [text_content, comment_id, post_id]
    const qs = `UPDATE comments SET text_content=$1 WHERE id=$2 AND post_id=$3`
    try {
        query(qs, params).then(data => {res.json(`Updated ${data.rowCount} rows under post ${post_id}`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

/** DELETE ROUTES */

// delete a user
app.delete('/users/:id', (req, res) => {
    const id = req.params.id
    
    const qs = `DELETE from Users where id=$1`
    const params = [id]
    try {
        query(qs, params).then(data => {res.json(`Number of users deleted: ${data.rowCount}`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// delete a post
app.delete('/posts/:id', (req, res) => {
    const id = req.params.id
    
    const qs = `DELETE from Posts WHERE id=$1`
    const params = [id]
    try {
        query(qs, params).then(data=>{res.json(`Number of posts deleted: ${data.rowCount}`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// delete a comment
app.delete('/comments/:id', (req, res) => {
    const id = req.params.id

    const qs = `DELETE FROM comments WHERE id=$1`
    const params = [id]
    try {
        query(qs, params).then(data => {res.json(`Number of comments deleted: ${data.rowCount}`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// delete a comment with a specific post id and comment id (kind of unnecessary but it is consistent with how comments are obtained.. so)
app.delete('/posts/:post_id/comments/:comment_id', (req, res) => {
    const post_id = req.params.post_id; const comment_id = req.params.comment_id

    const qs = `DELETE FROM comments WHERE id=$1 AND post_id=$2`
    const params = [comment_id, post_id]

    try {
        query(qs, params).then(data => {res.json(`Number of comments deleted: ${data.rowCount}`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

/** LIKES + DISLIKES ROUTES */

app.listen(app.get('port'), () => {
    console.log(`app is running at http://localhost:${DB_PORT}`)
    console.log("Press CTRL+C to stop\n")
})
