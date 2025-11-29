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

/** POST ROUTES */

// create a new user with desired fields, note that a user cannot be created with the same email as another user
app.post('/users', (req, res) => {
    const body = req.body

    const username = body["username"] || null
    const first_name = body["first_name"] || null
    const last_name = body["last_name"] || null
    const email = body["email"] || null
    const role = body["role"] || null
    const biography = body["biography"] || null
    const reports = body["reports"] || 0
    const display_name = body["display_name"] || first_name + ' ' + last_name || null

    const params = [username, first_name, last_name, email, role, biography, reports, display_name]

    const qs = `INSERT INTO Users 
                (username, first_name, last_name, email, role, biography, reports, display_name)
                values ($1, $2, $3, $4, $5, $6, $7, $8)`

    try {
        query(qs, params).then(data => {res.json(`Created user with id:${data.rows[0]["id"]}`)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})

/** PUT ROUTES */

/** DELETE ROUTES */

/** LIKES + DISLIKES ROUTES */

app.listen(app.get('port'), () => {
    console.log(`app is running at http://localhost:${DB_PORT}`)
    console.log("Press CTRL+C to stop\n")
})
