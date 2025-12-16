import bcrypt from 'bcrypt'

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

// uses bcrypt to compare a raw password with a hash obtained from our database
export async function comparePass(raw_pass, hash_pass) {
    try {
        const match = bcrypt.compare(raw_pass, hash_pass)
        return match
    } catch (error) {
        console.error("Error checking passwords: " + error.message)
        return false
    }
}

