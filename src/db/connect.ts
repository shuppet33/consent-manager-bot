import {Pool} from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: `../../.env` });


export const db = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
})

console.log(await db.query('select now()'))
