// same imports as server.js in server so queries can be used
import express from 'express'
import cors from 'cors'

import 'dotenv/config' //This will pull in the .env file

// importing bcrypt to hash passwords
import bcrypt from 'bcrypt'

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
        return new Promise((resolve) => {
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

// SALT_ROUNDS is a constant used for password hashing
const SALT_ROUNDS = 10
// hashes a password using bcrypt and returns the hash
export async function hashPassword(raw_pass) {
    try {
        const hash_pass = await bcrypt.hash(raw_pass, SALT_ROUNDS)
        return hash_pass
    } catch (error) {
        console.error("Error hashing password: " + error.message)
        throw new Error("Hashing failed") //critical error.. we do *not* want hashing to fail so it should stop the user creation process
    }
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
                            // NOTE: raw passcode entered by admin must be hashed before put in database
                            const raw_password = await askQuestion(`\n\tPassword: `)
                            

                            // params should be data gotten above by questions asked
                            const username = setusername || null
                            const first_name = setfirst_name || null
                            const last_name = setlast_name || null
                            const email = setemail || null
                            const role = setrole || 0
                            const biography = setbiography || null
                            const reports = setreports || 0
                            const display_name = setdisplay_name || first_name + ' ' + last_name || null
                            const hashed_password = await hashPassword(raw_password) || null
                        
                            const params = [username, first_name, last_name, email, role, biography, reports, display_name, hashed_password]
                        
                            const qs = `INSERT INTO Users 
                                        (username, first_name, last_name, email, role, biography, reports, display_name, hashed_password)
                                        values ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`
                        
                            try {
                                if (!username || !first_name || !last_name || !email || !raw_password) {
                                    throw new Error("ERROR: Missing one or more required fields.")
                                }
                                
                                if (role > 2 || role < -1) {
                                    throw new Error("ERROR: Invalid role given.")
                                }
                                await query(qs, params).then(data => {console.log({user_id:data.rows[0].id, body:`Created user with id: ${data.rows[0].id}`})})
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
                            // NOTE: raw passcode entered by admin must be hashed before put in database
                            const raw_password = await askQuestion(`\n\tPassword: `)
                            
                            
                            const username = setusername || user[0].username
                            const first_name = setfirst_name || user[0].first_name
                            const last_name = setlast_name || user[0].last_name
                            const email = setemail || user[0].email
                            const role = setrole || user[0].role
                            const biography = setbiography || user[0].biography
                            const reports = setreports || user[0].reports
                            const display_name = setdisplay_name || user[0].display_name
                            const hashed_password = await hashPassword(raw_password) || user[0].hashed_password
                            const id = user[0].id
                        
                            const params = [username, first_name, last_name, email, role, biography, reports, display_name, hashed_password, id]
                        
                            const qs = `UPDATE Users set username=$1, first_name = $2, last_name=$3, email=$4, role=$5, biography=$6, reports=$7, display_name=$8, hashed_password=$9 WHERE id=$10`
                        
                            try {
                                if (role > 2 || role < -1) {
                                    throw new Error("ERROR: Invalid role given.")
                                }
                                await query(qs, params).then(data => {console.log(`Number of users updated:${data.rowCount}`)})
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
                                    await query(qsNaN, params).then(data => console.log(`${data.rowCount} row deleted`))
                                } else {
                                    await query(qsNum, params).then(data => console.log(`${data.rowCount} row deleted`))
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
                                    await query(qs).then(data => {
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
                                console.log(post)
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
                                await query(qs, params).then(data => {console.log(`Number of posts updated:${data.rowCount}`)})
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (postsSelection == 2) {
                            console.log('Delete post')
                            const id = await askQuestion(`Please enter the id of the post you would like to delete: `)
                            const params = [id]
                            
                            const qs = `DELETE from Posts WHERE id=$1`
                        
                            try {
                                await query(qs, params).then(data => console.log(`${data.rowCount} row deleted`))
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (postsSelection == 3) {
                            console.log("Get post(s)")
                            const oneOrMore = await askQuestion(`Get options:\n\t1. Get all posts\n\t2. Get a specific post\n`)
                            if (oneOrMore == 1) {
                                const qs = `SELECT * FROM Posts`
                                try {
                                    await query(qs).then(data => {
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
                                console.log(comment)
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
                                await query(qs, params).then(data => {console.log(`Number of comments updated:${data.rowCount}`)})
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (commentsSelection == 2) {
                            console.log('Delete comment')
                            const id = await askQuestion(`Please enter the id of the comment you would like to delete: `)
                            const params = [id]
                            
                            const qs = `DELETE from Comments WHERE id=$1`
                        
                            try {
                                await query(qs, params).then(data => console.log(`${data.rowCount} row deleted`))
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (commentsSelection == 3) {
                            console.log("Get comment(s)")
                            const oneOrMore = await askQuestion(`Get options:\n\t1. Get all comments\n\t2. Get a specific comment\n`)
                            if (oneOrMore == 1) {
                                const qs = `SELECT * FROM Comments`
                                try {
                                    await query(qs).then(data => {
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
                    const reportsSelection = await askQuestion(`Reports options:\n\t1. Sort users by number of reports (most to least)\n\t2. Sort posts by number of reports (most to least)\n\t3. Get reports\n\t4. Delete a report\n`);
                    if (reportsSelection == 1) {
                        const qs = `SELECT * FROM Users ORDER BY reports DESC`
                        try {
                            await query(qs).then(data => {
                                for (let i = 0; i < data.rowCount; i++) {
                                    console.log(data.rows[i])
                                }
                            })
                        } catch (error) {
                            console.log(error.message)
                        }
                    } else if (reportsSelection == 2) {
                        const qs = `SELECT * FROM Posts ORDER BY reports DESC`
                        try {
                            await query(qs).then(data => {
                                for (let i = 0; i < data.rowCount; i++) {
                                    console.log(data.rows[i])
                                }
                            })
                        } catch (error) {
                            console.log(error.message)
                        }
                    } else if (reportsSelection == 3) {
                        console.log("Get report(s)")
                        const usersOrPosts = await askQuestion(`Get options:\n\t1. Get all reports\n\t2. Get reports for a specific user\n\t3. Get reports for a specific post\n\t4. Get reports for a specific comment\n`)
                        if (usersOrPosts == 1) {
                            const qs = `SELECT * FROM Reports`
                            try {
                                await query(qs).then(data => {
                                    for (let i = 0; i < data.rowCount; i++) {
                                        console.log(data.rows[i])
                                    }
                                })
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (usersOrPosts == 2) {
                            const id = await askQuestion(`Please enter the id of the user you would like to get the reports for: `)
                            const type = 0
                            const qs = `SELECT * FROM Reports WHERE target_id=$1 AND type=$2`
                            const params = [id, type]
                            try {
                                await query(qs, params).then(data => {
                                    for (let i = 0; i < data.rowCount; i++) {
                                        console.log(data.rows[i])
                                    }
                                })
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (usersOrPosts == 3) {
                            const id = await askQuestion(`Please enter the id of the post you would like to get the reports for: `)
                            const type = 1
                            const qs = `SELECT * FROM Reports WHERE target_id=$1 AND type=$2`
                            const params = [id, type]
                            try {
                                await query(qs, params).then(data => {
                                    for (let i = 0; i < data.rowCount; i++) {
                                        console.log(data.rows[i])
                                    }
                                })
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else if (usersOrPosts == 4) {
                            const id = await askQuestion(`Please enter the id of the comment you would like to get the reports for: `)
                            const type = 2
                            const qs = `SELECT * FROM Reports WHERE target_id=$1 AND type=$2`
                            const params = [id, type]
                            try {
                                await query(qs, params).then(data => {
                                    for (let i = 0; i < data.rowCount; i++) {
                                        console.log(data.rows[i])
                                    }
                                })
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else {
                            console.log("Not a get option, please try again later.")
                        }
                    } else if (reportsSelection == 4) {
                        console.log('Delete report')
                        const id = await askQuestion(`Please enter the id of the report you would like to delete: `)
                        const params = [id]

                        // getting report so you can use type and target_id change the reports count on it's target
                        const qs0 = `SELECT * FROM Reports WHERE id=$1`
                        let report = null
                        try {
                            report = await query(qs0, params)
                            report = post.rows
                        } catch (error) {
                            console.log(error.message)
                        }

                        const qs = `DELETE from Reports WHERE id=$1`
                    
                        try {
                            await query(qs, params).then(data => console.log(`${data.rowCount} row deleted`))
                        } catch (error) {
                            console.log(error.message)
                        }

                        if (report[0].type == 0) {
                            await deleteReportOnUser(report[0].target_id)
                        } else if (report[0].type == 1) {
                            await deleteReportOnPost(report[0].target_id)
                        } else if (report[0].type == 2) {
                            await deleteReportOnComment(report[0].target_id)
                        }
                    } else {
                        console.log("Wrong number Admin, please try again later.")
                    }
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

// Helper functions copied and edited from server.js
/** Helper function to add a report to a user */
async function deleteReportOnUser(user_id) {
    const qs = `UPDATE users SET reports = reports - 1 WHERE id=$1`
    const params = [user_id]

    await query(qs, params)
    return
}

/** Helper function to add a report to a post */
async function deleteReportOnPost(post_id) {
    const qs = `UPDATE posts SET reports = reports - 1 WHERE id=$1`
    const params = [post_id]

    await query(qs, params)
    return
}

/** Helper function to add a report to a comment */
async function deleteReportOnComment(comment_id) {
    const qs = `UPDATE comments SET reports = reports - 1 WHERE id=$1`
    const params = [comment_id]

    await query(qs, params)
    return
}