const express = require('express');
const mysql = require('mysql2');
const { authenticate } = require('./middleware');

const router = express.Router();
const dbPool = mysql
  .createPool({
    host: '127.0.0.1',
    user: 'root',
    password: null,
    database: 'sharebills',
  })
  .promise();

router.post('/accounts', authenticate, async (req, res) => {
  const { group_id } = req.body;
  const { user_id } = req.user;

  try {
    const [result] = await dbPool.execute(
      `
        INSERT INTO accounts (group_id, user_id)
        VALUES (?, ?)
      `,
      [group_id, user_id]
    );

    return res.status(201).send({ message: 'Account created successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

router.get('/accounts', authenticate, async (req, res) => {
  const { user_id } = req.user;

  try {
    const [result] = await dbPool.execute(
      `
          SELECT groups.name
          FROM accounts
          JOIN groups ON accounts.group_id = groups.id
          WHERE accounts.user_id = ?
        `,
      [user_id]
    );

    const groups = result.map((row) => row.name);

    return res.status(200).send({ groups });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

module.exports = router;
