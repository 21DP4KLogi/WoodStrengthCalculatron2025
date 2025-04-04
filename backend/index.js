const express = require('express')
const bodyParser = require('body-parser')
const postgres = require('postgres')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const crypto = require('node:crypto')

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
      token char(16),
      PRIMARY KEY(id)
    );
  `
  await psql`
    CREATE TABLE IF NOT EXISTS calculations (
      id serial,
      length double precision,
      width double precision,
      height double precision,
      strength double precision,
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

async function authCookieValid(cookie) {
  if (cookie === undefined) {
    return -1
  }
  const tokenBearer = await psql`
    SELECT * FROM users WHERE token = ${cookie};
  `
  if (tokenBearer.length === 1) {
    return tokenBearer[0].id
  } else {
    return -1
  }
}

app.post('/calculate', async (req, res) => {
  let tokenBearerId = await authCookieValid(req.cookies.auth)
  if (tokenBearerId === -1) {
    res.status(401)
    res.send()
    return
  }
  const sentLength = req.body.length
  const sentWidth = req.body.width
  const sentHeight = req.body.height
  const sentStrength = req.body.strength
  const pretestibasMoments = (sentWidth * sentHeight ** 2) / 6
  const pielaujamaSlodze = 8 * pretestibasMoments * (sentStrength / (sentLength ** 2))
  await psql`
    INSERT INTO calculations VALUES (
      default,
      ${sentLength},
      ${sentWidth},
      ${sentHeight},
      ${sentStrength},
      ${pielaujamaSlodze},
      ${tokenBearerId}
    )
  `
  res.send(pielaujamaSlodze)
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
    let cookieData = crypto.randomBytes(12).toString('base64')
    res.cookie("auth", cookieData, {
      maxAge: 1000*60*60,
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    })
    await psql`
      UPDATE users SET token = ${cookieData} WHERE name = ${req.body.name};
    `
    res.send()
  } else {
    res.status(400)
    res.send()
  }
})

app.post('/checkauth', async (req, res) => {
  if (await authCookieValid(req.cookies.auth) !== -1) {
    res.send()
  } else {
    res.status(401)
    res.send()
  }
})

app.listen(3000)
console.log("Serving on port 3000")
