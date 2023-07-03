const express = require('express');
const mysql = require('mysql2');

const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const cors = require('cors');
const { authenticate } = require('./middleware');
const groupsRoutes = require('./routes/groups');
const accountsRoutes = require('./accounts');
const billsRoutes = require('./bills');

require('dotenv').config();

const mysqlConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: null,
  database: 'sharebills',
};

const dbPool = mysql.createPool(mysqlConfig).promise();
const server = express();

server.use(express.json());
server.use(cors());
server.use('/groups', groupsRoutes);
app.use(accountsRoutes);
app.use(billsRoutes);

const userSchema = Joi.object({
  fullName: Joi.string().trim().required(),
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

server.get('/', authenticate, (req, res) => {
  console.log(req.user);
  res.status(200).send({ message: 'Authorized' });
});

server.post('/login', async (req, res) => {
  let payload = req.body;

  try {
    payload = await userSchema.validateAsync(payload);
  } catch (error) {
    console.error(error);

    return res.status(400).send({ error: 'All fields are required' });
  }

  try {
    const [data] = await dbPool.execute(
      `
        SELECT * FROM users
        WHERE email = ?
    `,
      [payload.email]
    );

    if (!data.length) {
      return res.status(400).send({ error: 'Email or password did not match' });
    }

    const isPasswordMatching = await bcrypt.compare(
      payload.password,
      data[0].password
    );

    if (isPasswordMatching) {
      const token = jwt.sign(
        {
          email: data[0].email,
          id: data[0].id,
        },
        process.env.JWT_SECRET
      );
      return res.status(200).send({ token });
    }

    return res.status(400).send({ error: 'Email or password did not match' });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

server.post('/register', async (req, res) => {
  let payload = req.body;

  try {
    payload = await userSchema.validateAsync(payload);
  } catch (error) {
    console.error(error);

    return res.status(400).send({ error: 'All fields are required' });
  }

  try {
    const encryptedPassword = await bcrypt.hash(payload.password, 10);
    const [response] = await dbPool.execute(
      `
            INSERT INTO users (full_name, email, password)
            VALUES (?, ?, ?)
        `,
      [payload.fullName, payload.email, encryptedPassword]
    );
    const token = jwt.sign(
      {
        email: payload.email,
        id: response.insertId,
        fullName: payload.fullName,
      },
      process.env.JWT_SECRET
    );
    return res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

app.get('/groups', authenticate, async (req, res) => {
  try {
    const dbPool = await mysql.createPool(mysqlConfig).promise();

    const [result] = await dbPool.execute(`
      SELECT * FROM groups
    `);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

const port = 8000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
