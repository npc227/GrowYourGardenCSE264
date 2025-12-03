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

// I think something with the promise in this function is triggering an error now and I don't know how to fix it
// node:internal/process/promises:394 triggerUncaughtException(err, true /* fromPromise */);
// Also somehting with port 5432 which isn't even called before the error happens and only in the .env file and the table intro still runs
const askQuestion = (question) => {
//   return new Promise((resolve, reject) => {
//     rl.question(question, (answer) => {
//       resolve(answer);
//     });
//   });
    // return new Promise((resolve, reject) => {
    //     try {
    //         rl.question(question, (answer) => {
    //                 resolve(answer)
    //         });
    //     } catch(error) {
    //         reject(error)
    //     }
    // });
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

// can't seem to get it to run only once, trying to use code from StackOverflow
// var something = (function() {
//     var executed = false;
//     return function() {
//         if (!executed) {
//             executed = true;
//             main()
//         }
//     };
// })();
// Think this made it run once now but now once you quit it doesn't stop the program
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
            const firstSelection = await askQuestion(`Welcome Admin!\nPlease enter the number of the table you would like to interact with:\n\t1. Users\n\t2. Posts\n\t3. Comments\n\t4. Reports\n\t5. Quit\n`);
                if (firstSelection == 1) {
                    //console.log("Users options:")
                    const userSelection = await askQuestion(`User options:\n\t1. Add\n\t2. Edit\n\t3. Delete\n`);
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
                            // body should be data gotten above by questions asked
                            //const body = [["username", setusername],["first_name", setfirst_name],["last_name", setlast_name],["email", setemail],["role", setrole],["biography", setbiography],["reports", setreports],["display_name", setdisplay_name]]
                        
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
                            const qs1 = `SELECT * FROM Users WHERE user_id=$1`
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
                        } else {
                            console.log("Wrong number Admin, please try again later.")
                        }
                } else if (firstSelection == 2) {
                    console.log("Posts options:")
                } else if (firstSelection == 3) {
                    console.log("Comments options:")
                } else if (firstSelection == 4) {
                    console.log("Reports options:")
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
        // console.log(`Hi ${name}!`);
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