import express from 'express'
import cors from 'cors'

import 'dotenv/config' //This will pull in the .env file

import { query } from './util/postgres.js'
import { uploadMulter, uploadGCS } from './util/cloudstorage.js'
import { hashPassword, comparePass, authenticateToken, loginUser, logoutUser, actionList, authorizeUser } from './util/authentication.js'

const DB_PORT = process.env.DB_PORT
// these are the three report types
const USER_REPORT = 0; const POST_REPORT = 1; const COMMENT_REPORT = 2;

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
app.get('/users', (_req, res) => {
    const qs = `SELECT * FROM Users WHERE id>0`
    try {
        query(qs).then(data => {
            const filteredUsers = data.rows.map(row => { //we have to remove the hashed passwords from the data..
                const { hashed_password, ...safeUser} = row
                return safeUser});
            res.json(filteredUsers)})
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
        query(qs, params).then(data => {
            const filteredUsers = data.rows.map(row => { //we have to remove the hashed passwords from the data..
                const { hashed_password, ...safeUser} = row
                return safeUser});
            res.json(filteredUsers)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

app.get('/users/me', authenticateToken, async (req, res) => {
   const qs = `SELECT * FROM users WHERE id=$1`
   const params = [req.user_id]
   try {
        query(qs, params).then(data => {data = data.rows[0]; const {hashed_password, ...r_user} = data; res.json(r_user)})
   } catch (error) {
        res.status(400).json(error.message)
   }
})

// get user with specified id (including test and admin accounts if requested)
app.get('/users/:id', (req, res) => {
    const qs = `SELECT * FROM Users WHERE id=$1`
    const params = [req.params.id]
    try {
        query(qs, params).then(data => {
            const filteredUsers = data.rows.map(row => { //we have to remove the hashed passwords from the data..
                const { hashed_password, ...safeUser} = row
                return safeUser});
            res.json(filteredUsers)})
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

// get post with specified id
app.get('/posts/:id', async (req, res) => {
    const qs = `SELECT * From Posts WHERE id=$1`
    const comment_qs = `SELECT * From Comments WHERE post_id=$1`

    const params = [req.params.id]
    try {
        let comment_data = await query(comment_qs, params)
        comment_data = comment_data.rows
        let post_data = await query(qs,params)
        post_data = post_data.rows[0]
        post_data["comments"] = comment_data; 
        res.json(post_data)
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
app.post('/login', async (req, res) => {
    const body = req.body
    const username = body["username"] || null; const password = body["password"] || null;
    if (!username || ! password) {
        res.status(400).json("Missing required fields")
    }

    const qs = `SELECT * FROM users WHERE username=$1`
    const params = [username]
    let data = await query(qs, params)
    data = data.rows[0] //usernames are unique so we should only get one
    if (comparePass(password, data["hashed_password"])) {
        const token = loginUser(data["id"])
        res.json(token)
    } else {
        res.status(401).json("No match for given username and password")
    }
})

// logs a user out by removing their token
app.post('/logout', async (req, res) => {
    const aHeader = req.headers['authorization']
    const token = aHeader && aHeader.split(' ')[1]

    if (!token) {
        res.status(400).json("No token given to logout")
    }

    const r_count = logoutUser(token)
    if (r_count > 0) {
        res.json(`Successfully logged out token: ${token}`)
    } else {
        res.json(`Token already logged out`)
    }
})

// create a new user with desired fields, note that a user cannot be created with the same email as another user
app.post('/users', async (req, res) => {
    const body = req.body

    const username = body["username"] || null
    const first_name = body["first_name"] || null
    const last_name = body["last_name"] || null
    const email = body["email"] || null
    const role = body["role"] || 0
    const biography = body["biography"] || null
    const display_name = body["display_name"] || first_name + ' ' + last_name || null
    const password = await hashPassword(body["password"]) || null

    if (!username || !first_name || !last_name || !email || !password) {
        res.status(400).json("Missing one or more required fields.")
    }

    if (role > 2 || role < -1) {
        res.status(400).json("Invalid role given.")
    }

    const params = [username, first_name, last_name, email, role, biography, display_name, password]

    const qs = `INSERT INTO Users 
                (username, first_name, last_name, email, role, biography, display_name, hashed_password)
                values ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`

    try {
       let data = await query(qs, params)
       res.json({user_id:data.rows[0].id, body:`Created user with id: ${data.rows[0].id}`})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// this route is mainly for testing purposes and would likely be removed from (or otherwise disabled on) a real release branch
app.post('/upload_file', authenticateToken, uploadMulter.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file found")
    }

    try {
        const publicUrl = await uploadGCS(req.file)

        res.status(200).send({
            message: "File uploaded successfully!",
            url: publicUrl
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to upload file to cloud storage')
    }
})

// create a new post with desired fields. Note that user ID must be a valid user
app.post('/posts', authenticateToken, authorizeUser("POST", actionList["WRITE"]), uploadMulter.single("image"), async (req, res) => {
    const file = req.file; let publicUrl = null;
    if (file) {
        console.log("Recieved image: " + file.originalname)
        publicUrl = await uploadGCS(file)
    }

    const body = req.body

    const user_id = req.user_id || null
    let username = await query(`SELECT username FROM users WHERE id=${user_id}`)
    username = username.rows[0]["username"]

    const text_content = body["text_content"] || null
    const title = body["title"] || null

    const params = [user_id, username, text_content, title, publicUrl]
    const qs = `INSERT INTO Posts (user_id, username, text_content, title, image) VALUES ($1, $2, $3, $4, $5)`

    try {
        query(qs, params).then(data => {res.json(`Created ${data.rowCount} new posts under user ${user_id}`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// create a new comment with the desired fields. Note that user and post ids must be valid
app.post('/posts/:post_id/comments', authenticateToken, authorizeUser("COMMENT", actionList["WRITE"]), async (req, res) => {
    const body = req.body
    const user_id = req.user_id || null; const post_id = req.params.post_id;
    const text_content = body["text_content"] || null
    const reports = 0; const likes = 0;

    if (!user_id || !post_id) {
        res.status(400).json("Missing required fields")
    }

    let username = await query(`SELECT username FROM users WHERE id=${user_id}`)
    username = username.rows[0]["username"]

    const params = [user_id, username, post_id, text_content, reports, likes]
    const qs = `INSERT INTO comments (user_id, username, post_id, text_content, reports, likes) VALUES ($1, $2, $3, $4, $5, $6)`

    try {
        query(qs, params).then(data => {res.json(`Created ${data.rowCount} new comments under user ${req.user_id}`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// create a new report on a user
app.post('/users/:id/reports', authenticateToken, authorizeUser("REPORT", actionList["WRITE"]), async (req, res) => {
    const body = req.body;
    const user_id = req.user_id || null; const reported_user_id = req.params.id
    const text_content = body["text_content"] || null
    const type = USER_REPORT

    if (!user_id || ! text_content) {
        res.status(400).json("Missing required fields!")
    }

    const params = [user_id, text_content, reported_user_id, type]
    const qs = `INSERT INTO reports (user_id, text_content, target_id, type) VALUES ($1, $2, $3, $4)`
    try {
        let data = await query(qs, params)
        data = data.rowCount
        addReportsOnUser(reported_user_id, 1)
        res.json(`Created ${data} new reports under user with id ${user_id} on user ${reported_user_id}`)
    } catch (error) {
        res.status(400).json(error.message)
    }

})

// create a new report on a post
app.post('/posts/:id/reports', authenticateToken, authorizeUser("REPORT", actionList["WRITE"]), async (req, res) => {
    const body = req.body;
    const user_id = req.user_id || null; const post_id = req.params.id
    const text_content = body["text_content"] || null
    const type = POST_REPORT

    if (!user_id || ! text_content) {
        res.status(400).json("Missing required fields!")
    }

    const params = [user_id, text_content, post_id, type]
    const qs = `INSERT INTO reports (user_id, text_content, target_id, type) VALUES ($1, $2, $3, $4)`
    try {
        let data = await query(qs, params)
        data = data.rowCount
        addReportsOnPost(post_id, 1)
        res.json(`Created ${data} new reports under user with id ${user_id} on post ${post_id}`)
    } catch (error) {
        res.status(400).json(error.message)
    }

})

// create a new report on a comment
app.post('/comments/:id/reports', authenticateToken, authorizeUser("REPORT", actionList["WRITE"]), async (req, res) => {
    const body = req.body;
    const user_id = req.user_id || null; const comment_id = req.params.id
    const text_content = body["text_content"] || null
    const type = COMMENT_REPORT

    if (!user_id || ! text_content) {
        res.status(400).json("Missing required fields!")
    }

    const params = [user_id, text_content, comment_id, type]
    const qs = `INSERT INTO reports (user_id, text_content, target_id, type) VALUES ($1, $2, $3, $4)`
    try {
        let data = await query(qs, params)
        data = data.rowCount
        addReportsOnComment(comment_id, 1)
        res.json(`Created ${data} new reports under user with id ${user_id} on comment ${comment_id}`)
    } catch (error) {
        res.status(400).json(error.message)
    }

})

/** PUT ROUTES */

// update a user
app.put('/users/:id', authenticateToken, authorizeUser("USER", actionList["UPDATE"]), (req, res) => {
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
app.put('/posts/:id', authenticateToken, authorizeUser("POST", actionList["UPDATE"]), (req, res) => {
    const body = req.body
    const id = req.params.id
    const user_id = req.user_id

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
app.put('/posts/:post_id/comments/:comment_id', authenticateToken, authorizeUser("COMMENT", actionList["UPDATE"]), (req, res) => {
    const body = req.body
    const post_id = req.params.post_id
    const comment_id = req.params.comment_id
    const user_id = req.user_id
    
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
app.delete('/users/:id', authenticateToken, authorizeUser("USER", actionList["UPDATE"]), (req, res) => {
    const id = req.params.id
    const user_id = req.user_id
    
    const qs = `DELETE from Users where id=$1`
    const params = [id]
    try {
        query(qs, params).then(data => {res.json(`Number of users deleted: ${data.rowCount}`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// delete a post
app.delete('/posts/:id', authenticateToken, authorizeUser("POST", actionList["UPDATE"]), (req, res) => {
    const id = req.params.id
    const user_id = req.user_id
    
    const qs = `DELETE from Posts WHERE id=$1`
    const params = [id]
    try {
        query(qs, params).then(data=>{res.json(`Number of posts deleted: ${data.rowCount}`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// delete a comment
app.delete('/comments/:id', authenticateToken, authorizeUser("COMMENT", actionList["UPDATE"]), (req, res) => {
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
app.delete('/posts/:post_id/comments/:id', authenticateToken, authorizeUser("COMMENT", actionList["UPDATE"]), (req, res) => {
    const post_id = req.params.post_id; const comment_id = req.params.id
    const user_id = req.user_id

    const qs = `DELETE FROM comments WHERE id=$1 AND post_id=$2`
    const params = [comment_id, post_id]

    try {
        query(qs, params).then(data => {res.json(`Number of comments deleted: ${data.rowCount}`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

/** LIKES + DISLIKES ROUTES */

// user attempts to like a post
/**
 * BEHAVIOR:
 * User has not liked nor disliked post previously, clicks button -> adds user like
 * User has liked post previously, clicks button again -> removes user like
 * User has disliked post previously, clicks like button -> removes user dislike, adds user like
 */
app.put('/posts/:post_id/like', authenticateToken, async (req, res) => {
    const body = req.body

    const user_id = req.user_id
    const post_id = req.params.post_id;

    const initial_query = `SELECT * FROM post_likes WHERE user_id=$1 AND post_id=$2`
    const initial_params = [user_id, post_id]

    try {
        const priorLike = (await query(initial_query, initial_params)).rows[0]
        const params = [user_id, post_id]

        if (priorLike) { //If the like already exists, see whether it is positive or negative, and act accordingly

            if (priorLike["value"] == 1) { //user liked post previously, removing like
                const del_query = `DELETE FROM post_likes WHERE user_id=$1 AND post_id=$2`
                await addLikesOnPost(post_id,-1)
                await query(del_query, params)
                res.json({"like_status": 0, "dislike_status":0})
            } else { //user disliked post previously, remove dislike and add like
                const upd_query = `UPDATE post_likes SET value=1 WHERE user_id=$1 AND post_id=$2`
                await addLikesOnPost(post_id, 2) //total difference in score is 2
                await query(upd_query, params)
                res.json({"like_status": 1, "dislike_status":0})
            }
            
        } else { //user has not interacted with post yet, so we can just add a dislike
            const add_query = `INSERT INTO post_likes (user_id, post_id, value) VALUES ($1, $2, 1)`
            await addLikesOnPost(post_id, 1)
            await query(add_query, params)
            res.json({"like_status": 1, "dislike_status":0})
        }
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// user attempts to dislike a post
/**
 * BEHAVIOR:
 * User has not liked nor disliked post previously, clicks button -> adds user dislike
 * User has disliked post previously, clicks button again -> removes user dislike
 * User has disliked post previously, clicks like button -> removes user dislike, adds user like
 */
app.put('/posts/:post_id/dislike', authenticateToken, async (req, res) => {
    const body = req.body

    const user_id = req.user_id
    const post_id = req.params.post_id;

    const initial_query = `SELECT * FROM post_likes WHERE user_id=$1 AND post_id=$2`
    const initial_params = [user_id, post_id]

    try {
        const priorLike = (await query(initial_query, initial_params)).rows[0]
        const params = [user_id, post_id]

        if (priorLike) { //If the like already exists, see whether it is positive or negative, and act accordingly

            if (priorLike["value"] == -1) { //user disliked post previously, removing dislike
                const del_query = `DELETE FROM post_likes WHERE user_id=$1 AND post_id=$2`
                await addLikesOnPost(post_id,1)
                await query(del_query, params)
                res.json({"like_status": 0, "dislike_status":0})
            } else { //user liked post previously, remove like and add dislike
                const upd_query = `UPDATE post_likes SET value = -1 WHERE user_id=$1 AND post_id=$2`
                await addLikesOnPost(post_id, -2) //total difference in score is -2
                await query(upd_query, params)
                res.json({"like_status": 0, "dislike_status": -1})
            }
            
        } else { //user has not interacted with post yet, so we can just add a dislike
            const add_query = `INSERT INTO post_likes (user_id, post_id, value) VALUES ($1, $2, -1)`
            await addLikesOnPost(post_id, -1)
            await query(add_query, params)
            res.json({"like_status": 0, "dislike_status": -1})
        }
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// user attempts to like a comment
/**
 * BEHAVIOR:
 * User has not liked nor disliked comment previously, clicks button -> adds user like
 * User has liked comment previously, clicks button again -> removes user like
 * User has disliked comment previously, clicks like button -> removes user dislike, adds user like
 */
app.put('/posts/:post_id/comments/:comment_id/like', authenticateToken, async (req, res) => {
    const body = req.body

    const user_id = req.user_id
    const comment_id = req.params.comment_id;

    const initial_query = `SELECT * FROM comment_likes WHERE user_id=$1 AND comment_id=$2`
    const initial_params = [user_id, comment_id]

    try {
        const priorLike = (await query(initial_query, initial_params)).rows[0]
        const params = [user_id, comment_id]

        if (priorLike) { //If the like already exists, see whether it is positive or negative, and act accordingly

            if (priorLike["value"] == 1) { //user liked post previously, removing like
                const del_query = `DELETE FROM comment_likes WHERE user_id=$1 AND comment_id=$2`
                await addLikesOnComment(comment_id,-1)
                await query(del_query, params)
                res.json({"like_status": 0, "dislike_status":0})
            } else { //user disliked post previously, remove dislike and add like
                const upd_query = `UPDATE comment_likes SET value=1 WHERE user_id=$1 AND comment_id=$2`
                await addLikesOnComment(comment_id, 2) //total difference in score is 2
                await query(upd_query, params)
                res.json({"like_status": 1, "dislike_status":0})
            }
            
        } else { //user has not interacted with post yet, so we can just add a dislike
            const add_query = `INSERT INTO comment_likes (user_id, comment_id, value) VALUES ($1, $2, 1)`
            await addLikesOnComment(comment_id, 1)
            await query(add_query, params)
            res.json({"like_status": 1, "dislike_status":0})
        }
    } catch (error) {
        res.status(400).json(error.message)
    }
})

// user attempts to dislike a comment
/**
 * BEHAVIOR:
 * User has not liked nor disliked comment previously, clicks button -> adds user dislike
 * User has disliked comment previously, clicks button again -> removes user dislike
 * User has liked comment previously, clicks like button -> removes user like, adds user dislike
 */
app.put('/posts/:post_id/comments/:comment_id/dislike', authenticateToken, async (req, res) => {
    const body = req.body

    const user_id = req.user_id
    const comment_id = req.params.comment_id;

    const initial_query = `SELECT * FROM comment_likes WHERE user_id=$1 AND comment_id=$2`
    const initial_params = [user_id, comment_id]

    try {
        const priorLike = (await query(initial_query, initial_params)).rows[0]
        const params = [user_id, comment_id]

        if (priorLike) { //If the like already exists, see whether it is positive or negative, and act accordingly

            if (priorLike["value"] == -1) { //user disliked post previously, removing dislike
                const del_query = `DELETE FROM comment_likes WHERE user_id=$1 AND comment_id=$2`
                await addLikesOnComment(comment_id, 1)
                await query(del_query, params)
                res.json({"like_status": 0, "dislike_status":0})
            } else { //user disliked post previously, remove dislike and add like
                const upd_query = `UPDATE comment_likes SET value=1 WHERE user_id=$1 AND comment_id=$2`
                await addLikesOnComment(comment_id, -2) //total difference in score is -2
                await query(upd_query, params)
                res.json({"like_status": 0, "dislike_status":1})
            }
            
        } else { //user has not interacted with post yet, so we can just add a dislike
            const add_query = `INSERT INTO comment_likes (user_id, comment_id, value) VALUES ($1, $2, -1)`
            await addLikesOnComment(comment_id, -1)
            await query(add_query, params)
            res.json({"like_status": 0, "dislike_status":1})
        }
    } catch (error) {
        res.status(400).json(error.message)
    }
})


app.listen(app.get('port'), () => {
    console.log(`app is running at http://localhost:${DB_PORT}`)
    console.log("Press CTRL+C to stop\n")
})

/** Helper function to adjust the number of total likes and dislikes (as a score) a post has */
async function addLikesOnPost(post_id, num) {
    const qs = `UPDATE posts SET likes = likes + ${num} WHERE id=$1`
    const params = [post_id]

    await query(qs, params)
    return
}

/** Helper function to adjust the number of total likes and dislikes (as a score) a comment has */
async function addLikesOnComment(comment_id, num) {
    const qs = `UPDATE comments SET likes = likes + ${num} WHERE id=$1`
    const params = [comment_id]

    await query(qs, params)
    return
}

/** Helper function to add a report to a user */
async function addReportsOnUser(user_id, num) {
    const qs = `UPDATE users SET reports = reports + ${num} WHERE id=$1`
    const params = [user_id]

    await query(qs, params)
    return
}

/** Helper function to add a report to a post */
async function addReportsOnPost(post_id, num) {
    const qs = `UPDATE posts SET reports = reports + ${num} WHERE id=$1`
    const params = [post_id]

    await query(qs, params)
    return
}

/** Helper function to add a report to a comment */
async function addReportsOnComment(comment_id, num) {
    const qs = `UPDATE comments SET reports = reports + ${num} WHERE id=$1`
    const params = [comment_id]

    await query(qs, params)
    return
}
