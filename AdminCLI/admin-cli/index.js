// same imports as server.js in server so queries can be used
import express from 'express'
import cors from 'cors'

import 'dotenv/config' //This will pull in the .env file

// import readline so I can do command line interaction
import readline from 'node:readline'

import { query } from './util/postgres.js'

const DB_PORT = process.env.DB_PORT

const app = express()

app.set('port', DB_PORT)

app.use(express.json())
app.use(cors())

// Basic command line interaction in JS from nodejs.org
//const readline = require('node:readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question) => {
    try {
        return new Promise((resolve, reject) => {
                rl.question(question, (answer) => {
                        resolve(answer)
                });
            })
    } catch(error) {
            console.log(error)
    }
};

function once(fn, context) { 
    var result;
    return function() { 
        if (fn) {
            result = fn.apply(context || this, arguments);
            fn = null;
        }
        return result;
    };
}

const firstSelection = 0

let main 
    try {
        main = async () => {
        while (firstSelection != 5) {
            // quit option does not work btw
            const firstSelection = await askQuestion(`Welcome Admin!\nPlease enter the number of the table you would like to interact with:\n\t1. Users\n\t2. Posts\n\t3. Comments\n\t4. Reports\n\t5. Quit\n`);
                if (firstSelection == 1) {
                    const userSelection = await askQuestion(`User options:\n\t1. Add\n\t2. Edit\n\t3. Delete\n\t4. Get\n`);
                        if (userSelection == 1) {
                            console.log('Add user')
                            const setusername = await askQuestion(`Please enter the information for the user you would like to add:\n\tUsername: `)
                            const setfirst_name = await askQuestion(`\n\tFirst name: `)
                            const setlast_name = await askQuestion(`\n\tLast name: `)
                            const setemail = await askQuestion(`\n\tEmail: `)
                            const setrole = await askQuestion(`\n\tRole: `)
                            const setbiography = await askQuestion(`\n\tBiography: `)
                            const setreports = await askQuestion(`\n\tReports: `)
                            const setdisplay_name = await askQuestion(`\n\tDisplay name: `)

                            // params should be data gotten above by questions asked
                            const username = setusername || null
                            const first_name = setfirst_name || null
                            const last_name = setlast_name || null
                            const email = setemail || null
                            const role = setrole || 0
                            const biography = setbiography || null
                            const reports = setreports || 0
                            const display_name = setdisplay_name || first_name + ' ' + last_name || null
                        
                            if (role > 2) {
                                console.log("Invalid role given.")
                            }
                        
                            const params = [username, first_name, last_name, email, role, biography, reports, display_name]
                        
                            const qs = `INSERT INTO Users 
                                        (username, first_name, last_name, email, role, biography, reports, display_name)
                                        values ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`
                        
                            try {
                                query(qs, params).then(data => {console.log({user_id:data.rows[0].id, body:`Created user with id: ${data.rows[0].id}`})})
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (userSelection == 2) {
                            console.log('Edit user')
                            const idorusername = await askQuestion(`Please enter the id or username of the user you would like to edit: `)
                            
                            // get original user data and instead of || null do || original data
                            const qs0 = `SELECT * FROM Users WHERE username=$1`
                            const qs1 = `SELECT * FROM Users WHERE id=$1`
                            const params0 = [idorusername]
                            let user = null
                            try {
                                if (isNaN(idorusername)) {
                                    user = await query(qs0, params0)
                                    user = user.rows
                                    console.log(user)
                                } else {
                                    user = await query(qs1, params0)
                                    user = user.rows
                                    console.log(user)
                                }
                            } catch (error) {
                                console.log(error.message)
                            }
                            const setusername = await askQuestion(`Please enter the information you would like to edit for this user:\n\tUsername: `)
                            const setfirst_name = await askQuestion(`\n\tFirst name: `)
                            const setlast_name = await askQuestion(`\n\tLast name: `)
                            const setemail = await askQuestion(`\n\tEmail: `)
                            const setrole = await askQuestion(`\n\tRole: `)
                            const setbiography = await askQuestion(`\n\tBiography: `)
                            const setreports = await askQuestion(`\n\tReports: `)
                            const setdisplay_name = await askQuestion(`\n\tDisplay name: `)
                            
                            
                            const username = setusername || user[0].username
                            const first_name = setfirst_name || user[0].first_name
                            const last_name = setlast_name || user[0].last_name
                            const email = setemail || user[0].email
                            const role = setrole || user[0].role
                            const biography = setbiography || user[0].biography
                            const reports = setreports || user[0].reports
                            const display_name = setdisplay_name || user[0].display_name
                            const id = user[0].id
                        
                            if (role > 2) {
                                console.log("Invalid role given.")
                            }
                        
                            const params = [username, first_name, last_name, email, role, biography, reports, display_name, id]
                        
                            const qs = `UPDATE Users set username=$1, first_name = $2, last_name=$3, email=$4, role=$5, biography=$6, reports=$7, display_name=$8 WHERE id=$9`
                        
                            try {
                                query(qs, params).then(data => {console.log(`Number of users updated:${data.rowCount}`)})
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (userSelection == 3) {
                            console.log('Delete user')
                            const idorusername = await askQuestion(`Please enter the id or username of the user you would like to delete: `)
                            const params = [idorusername]
                            
                            // need to be able to process for both id and username
                            const qsNaN = `DELETE from Users WHERE username=$1`
                            const qsNum = `DELETE from Users WHERE id=$1`
                        
                            try {

                                if (isNaN(idorusername)) {
                                    query(qsNaN, params).then(data => console.log(`${data.rowCount} row deleted`))
                                } else {
                                    query(qsNum, params).then(data => console.log(`${data.rowCount} row deleted`))
                                }
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (userSelection == 4) {
                            console.log("Get user(s)")
                            const oneOrMore = await askQuestion(`Get options:\n\t1. Get all users\n\t2. Get a specific user\n`)
                            if (oneOrMore == 1) {
                                const qs = `SELECT * FROM Users`
                                try {
                                    query(qs).then(data => {
                                        for (let i = 0; i < data.rowCount; i++) {
                                            console.log(data.rows[i])
                                        }
                                    })
                                } catch (error) {
                                    console.log(error.message)
                                }
                            } else if (oneOrMore == 2) {
                                const idorusername = await askQuestion(`Please enter the id or username of the user you would like to get: `)
                            
                                const qs0 = `SELECT * FROM Users WHERE username=$1`
                                const qs1 = `SELECT * FROM Users WHERE id=$1`
                                const params0 = [idorusername]
                                let user = null
                                try {
                                    if (isNaN(idorusername)) {
                                        user = await query(qs0, params0)
                                        user = user.rows
                                        console.log(user)
                                    } else {
                                        user = await query(qs1, params0)
                                        user = user.rows
                                        console.log(user)
                                    }
                                } catch (error) {
                                    console.log(error.message)
                                }
                            } else {
                                console.log("Not a get option, please try again later.")
                            }
                        } else {
                            console.log("Wrong number Admin, please try again later.")
                        }
                } else if (firstSelection == 2) {
                    const postsSelection = await askQuestion(`Posts options:\n\t1. Edit\n\t2. Delete\n\t3. Get\n`);
                        if (postsSelection == 1) {
                            console.log('Edit post')
                            const id0 = await askQuestion(`Please enter the id of the post you would like to edit: `)
                            
                            // get original user data and instead of || null do || original data
                            const qs0 = `SELECT * FROM Posts WHERE id=$1`
                            const params0 = [id0]
                            let post = null
                            try {
                                post = await query(qs0, params0)
                                post = post.rows
                            } catch (error) {
                                console.log(error.message)
                            }
                            const settext_content = await askQuestion(`Please enter the information you would like to edit for this post:\n\tText content: `)
                            const settitle = await askQuestion(`\n\tTitle: `)
                            const setreports = await askQuestion(`\n\tReports: `)
                            const setlikes = await askQuestion(`\n\tLikes: `)
                            
                            // not editing username or user id because it doesn't make sense to edit who made the post from the command line
                            const text_content = settext_content || post[0].text_content
                            const title = settitle || post[0].title
                            const reports = setreports || post[0].reports
                            const likes = setlikes || post[0].likes
                            const id = post[0].id
                        
                            const params = [text_content, title, reports, likes, id]
                            
                            const qs = `UPDATE Posts set text_content = $1, title=$2, reports=$3, likes=$4 WHERE id=$5`
                        
                            try {
                                query(qs, params).then(data => {console.log(`Number of posts updated:${data.rowCount}`)})
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (postsSelection == 2) {
                            console.log('Delete post')
                            const id = await askQuestion(`Please enter the id of the post you would like to delete: `)
                            const params = [id]
                            
                            const qs = `DELETE from Posts WHERE id=$1`
                        
                            try {
                                query(qs, params).then(data => console.log(`${data.rowCount} row deleted`))
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (postsSelection == 3) {
                            console.log("Get post(s)")
                            const oneOrMore = await askQuestion(`Get options:\n\t1. Get all posts\n\t2. Get a specific post\n`)
                            if (oneOrMore == 1) {
                                const qs = `SELECT * FROM Posts`
                                try {
                                    query(qs).then(data => {
                                        for (let i = 0; i < data.rowCount; i++) {
                                            console.log(data.rows[i])
                                        }
                                    })
                                } catch (error) {
                                    console.log(error.message)
                                }
                            } else if (oneOrMore == 2) {
                                const id = await askQuestion(`Please enter the id of the post you would like to get: `)
                                const qs = `SELECT * FROM Posts WHERE id=$1`
                                const params = [id]
                                let post = null
                                try {
                                    post = await query(qs, params)
                                    post = post.rows
                                    console.log(post)
                                } catch (error) {
                                    console.log(error.message)
                                }
                            } else {
                                console.log("Not a get option, please try again later.")
                            }
                        } else {
                            console.log("Wrong number Admin, please try again later.")
                        }
                } else if (firstSelection == 3) {
                    const commentsSelection = await askQuestion(`Comments options:\n\t1. Edit\n\t2. Delete\n\t3. Get\n`);
                        if (commentsSelection == 1) {
                            console.log('Edit comment')
                            const id0 = await askQuestion(`Please enter the id of the comment you would like to edit: `)
                            
                            // get original user data and instead of || null do || original data
                            const qs0 = `SELECT * FROM Comments WHERE id=$1`
                            const params0 = [id0]
                            let comment = null
                            try {
                                comment = await query(qs0, params0)
                                comment = comment.rows
                            } catch (error) {
                                console.log(error.message)
                            }
                            const settext_content = await askQuestion(`Please enter the information you would like to edit for this comment:\n\tText content: `)
                            const setreports = await askQuestion(`\n\tReports: `)
                            const setlikes = await askQuestion(`\n\tLikes: `)
                            
                            // not editing username, user_id, or post_id
                            const text_content = settext_content || comment[0].text_content
                            const reports = setreports || comment[0].reports
                            const likes = setlikes || comment[0].likes
                            const id = comment[0].id
                        
                            const params = [text_content, reports, likes, id]
                            
                            const qs = `UPDATE Comments set text_content = $1, reports=$2, likes=$3 WHERE id=$4`
                        
                            try {
                                query(qs, params).then(data => {console.log(`Number of comments updated:${data.rowCount}`)})
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (commentsSelection == 2) {
                            console.log('Delete comment')
                            const id = await askQuestion(`Please enter the id of the comment you would like to delete: `)
                            const params = [id]
                            
                            const qs = `DELETE from Comments WHERE id=$1`
                        
                            try {
                                query(qs, params).then(data => console.log(`${data.rowCount} row deleted`))
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (commentsSelection == 3) {
                            console.log("Get comment(s)")
                            const oneOrMore = await askQuestion(`Get options:\n\t1. Get all comments\n\t2. Get a specific comment\n`)
                            if (oneOrMore == 1) {
                                const qs = `SELECT * FROM Comments`
                                try {
                                    query(qs).then(data => {
                                        for (let i = 0; i < data.rowCount; i++) {
                                            console.log(data.rows[i])
                                        }
                                    })
                                } catch (error) {
                                    console.log(error.message)
                                }
                            } else if (oneOrMore == 2) {
                                const id = await askQuestion(`Please enter the id of the comment you would like to get: `)
                                const qs = `SELECT * FROM Comments WHERE id=$1`
                                const params = [id]
                                let comment = null
                                try {
                                    comment = await query(qs, params)
                                    comment = comment.rows
                                    console.log(comment)
                                } catch (error) {
                                    console.log(error.message)
                                }
                            } else {
                                console.log("Not a get option, please try again later.")
                            }
                        } else {
                            console.log("Wrong number Admin, please try again later.")
                        }
                } else if (firstSelection == 4) {
                    console.log("Reports options:")
                    const reportsSelection = await askQuestion(`Reports options:\n\t1. Sort users by number of reports\n\t2. Sort posts by number of reports\n`);
                    
                } else if (firstSelection == 5) {
                    console.log("Goodbye")
                    return;
                } else {
                    if (firstSelection != 5) {
                        console.log("Wrong number Admin, please try again later.")
                    }
                }
            }
            rl.close();
    } 
} catch (error) {
        console.log(error)
    }

// something();
function something() { main() }
var one_something = once(something);

try {   
    one_something();
} catch (error) {
    console.log(error)
}