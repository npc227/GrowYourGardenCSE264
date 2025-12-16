import bcrypt from 'bcrypt'
import NodeCache from 'node-cache'
import jwt from 'jsonwebtoken'

const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = '1h'

const loginCache =  new NodeCache({
    stdTTL: 3600, //logins last for one hour
    checkperiod: 300, //check for expired tokens every five minutes
})

console.log("ADMIN TOKEN: " + loginUser(-1)) //login the admin by default

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

// stores session in nodecache
function storeSession(token, user_id) {
    const s = loginCache.set(token, user_id)
    if (s) {
        console.log(`User with id: ${user_id} is logged in.`)
    }
}

// checks whether a token is logged in the session cache
function getSessionUser(token) {
    const user_id = loginCache.get(token)

    if (user_id) {
        console.log(`Found session for user with id ${user_id}`)
        loginCache.ttl(token, 3600)
        return user_id
    } else {
        console.log(`Session expired or nonexistent`)
        return null
    }
}

// creates a jwt and places it into the session cache
export function loginUser(user_id) {
    const payload = {
        sub: user_id, //subject is user id
        iat: Date.now() / 1000 //issued at 
    }

    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRY
    })

    storeSession(token, user_id)

    return token
}

// removes the token from the cache, so the user can no longer interact with api
export function logoutUser(token) {
    return loginCache.del(token)
}

export function authenticateToken(req, res, next) {
    const aHeader = req.headers['authorization']
    const token = aHeader && aHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json("No authentication token.") //401 bc auth error
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json("Invalid or expired auth token: " + err.message)
        }

        // check to make sure the user is still logged in
        if (getSessionUser(token) != user.sub) {
            return res.status(401).json("Invalid or expired auth token.")
        }

        req.user_id = user.sub
        next()
    });
}
