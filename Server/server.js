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

// get all users
app.get('/users', (req, res) => {
    const qs = `SELECT * FROM Users`
    try {
        query(qs).then(data => {res.json(data.rows)})
    } catch (error) {
        res.status(400).json(error.message)
    }
})


/** POST ROUTES */

/** PUT ROUTES */

/** DELETE ROUTES */

/** LIKES + DISLIKES ROUTES */

app.listen(app.get('port'), () => {
    console.log(`app is running at http://localhost:${DB_PORT}`)
    console.log("Press CTRL+C to stop\n")
})
