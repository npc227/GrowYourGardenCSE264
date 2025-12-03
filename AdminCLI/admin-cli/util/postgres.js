import pg from 'pg'

const { Client } = pg
const DATABASE_URL = process.env.DATABASE_URL

/** Similar to what we did in class, but we only need the url given by supabase */
const client = new Client({
        connectionString: DATABASE_URL
})


client.connect()

/**
 * How to use this function:
 * query(qs).then(data) => res.json(data.rows)
 */
export const query = async (text, values) => {
    try {
        
        const now = new Date() //Start time
        console.log("Query to be executed: ", text)
        const res = await client.query(text, values) //Query db
        const now2 = new Date() //End time
        console.log(`It took ${now2-now}ms to run.`) //Log how long
        return res //Return query result

    } catch (err) {

        console.error("Problem with query")
        console.error(err)
        throw err

    }
}