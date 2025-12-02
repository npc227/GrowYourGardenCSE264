// Basic command line interaction in JS from nodejs.org
const readline = require('node:readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
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

const main = async () => {
    while (firstSelection != 5) {
        const firstSelection = await askQuestion(`Welcome Admin!\nPlease enter the number of the table you would like to interact with:\n\t1. Users\n\t2. Posts\n\t3. Comments\n\t4. Reports\n\t5. Quit\n`);
            if (firstSelection == 1) {
                //console.log("Users options:")
                userSelection = await askQuestion(`User options:\n\t1. Add\n\t2. Edit\n\t3. Delete\n`);
                    if (userSelection == 1) {
                        console.log('Add user')
                        const username = askQuestion(`Please enter the information for the user you would like to add:\n\tUsername: `)
                        const first_name = askQuestion(`\n\tFirst name: `)
                        const last_name = askQuestion(`\n\tLast name: `)
                        const email = askQuestion(`\n\tEmail: `)
                        const role = askQuestion(`\n\tRole: `)
                        const biography = askQuestion(`\n\tBiography: `)
                        const reports = askQuestion(`\n\tReports: `)
                        const display_name = askQuestion(`\n\tDisplay name: `)
                        app.post('/users', (req, res) => {
                            // body should be data gotten above by questions asked
                            const body = [["username", username],["first_name", first_name],["last_name", last_name],["email", email],["role", role],["biography", biography],["reports", reports],["display_name", display_name]]
                        
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
                    } else if (userSelection == 2) {
                        console.log('Edit user')
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
        // console.log(`Hi ${name}!`);
    }
    rl.close();
};

// something();
function something() { main() }
var one_something = once(something);

one_something();