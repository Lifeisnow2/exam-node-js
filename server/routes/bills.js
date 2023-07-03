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

router.get('/bills/:group_id', authenticate, async (req, res) => {
  const { group_id } = req.params;

  try {
    const [result] = await dbPool.execute(
      `
        SELECT *
        FROM bills
        WHERE group_id = ?
      `,
      [group_id]
    );

    const bills = result;

    return res.status(200).send({ bills });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

router.post('/bills', authenticate, async (req, res) => {
  const { group_id, amount, description } = req.body;

  try {
    const [result] = await dbPool.execute(
      `
        INSERT INTO bills (group_id, amount, description)
        VALUES (?, ?, ?)
      `,
      [group_id, amount, description]
    );

    const billId = result.insertId;

    return res.status(201).send({ billId });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

module.exports = router;
