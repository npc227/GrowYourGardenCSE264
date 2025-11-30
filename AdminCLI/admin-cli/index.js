// Basic command line interaction in JS from nodejs.org
const readline = require('node:readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question(`Welcome Admin!\nPlease enter the number of the table you would like to interact with:\n\t1. Users\n\t2. Posts\n\t3. Comments\n\t4. Reports\n`, number => {
    if (number == 1) {
        //console.log("Users options:")
        rl.question(`User options:\n\t1. Add\n\t2. Edit\n\t3. Delete`, userSelection => {
            if (userSelection == 1) {
                console.log('Add user')
            } else if (userSelection == 2) {
                console.log('Edit user')
            } else if (userSelection == 3) {
                console.log('Delete user')
            } else {
                console.log("Wrong number Admin, please try again later.")
            }
        })
    } else if (number == 2) {
        console.log("Posts options:")
    } else if (number == 3) {
        console.log("Comments options:")
    } else if (number == 4) {
        console.log("Reports options:")
    } else {
        console.log("Wrong number Admin, please try again later.")
    }
  // console.log(`Hi ${name}!`);
  rl.close();
});