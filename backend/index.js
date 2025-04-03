const express = require('express')
const bodyParser = require('body-parser')
const postgres = require('postgres')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')

console.log(process.env.DB_PASS)

const psql = postgres({
  host: process.env.DB_HOST ?? "localhost",
  port: process.env.DB_PORT ?? 5432,
  database: process.env.DB_NAME ?? "woodcalculator",
  username: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASS,
})

async function initdb() {
  await psql`
    CREATE TABLE IF NOT EXISTS users (
      id serial,
      name varchar(30),
      password char(60),
      PRIMARY KEY(id)
    );
  `
  await psql`
    CREATE TABLE IF NOT EXISTS calculations (
      id serial,
      length double precision,
      width double precision,
      height double precision,
      result double precision,
      userid integer,
      PRIMARY KEY(id),
      CONSTRAINT fk_user FOREIGN KEY(userid)
        REFERENCES users(id)
    );
  `
}
initdb()


const app = express()
app.use(bodyParser.urlencoded())
app.use(cookieParser())

app.post('/calculate', (req, res) => {

})

app.post('/login', async (req, res) => {
  const passwordHash = await psql`
    SELECT password FROM users WHERE name = ${req.body.name};
  `
  if (passwordHash.length === 0) {
    res.status(400)
    res.send()
    return
  }
  const passwordMatch = await bcrypt.compare(req.body.pass, passwordHash[0].password)
  if (passwordMatch) {
    res.cookie("auth", "hello", {
      maxAge: 1000*60*60,
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    })
    res.send('Aye!')
  } else {
    res.status(400)
    res.send('Nay.')
  }
})

app.post('/checkauth', (req, res) => {

})

app.listen(3000)
console.log("Serving on port 3000")
