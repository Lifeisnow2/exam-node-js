const dbPool = mysql.createPool(mysqlConfig).promise();

server.post('/groups', authenticate, async (req, res) => {
  const { name } = req.body;
  const { id: userId } = req.user;

  try {
    const [result] = await dbPool.execute(
      `
        INSERT INTO groups (name)
        VALUES (?)
      `,
      [name]
    );

    const groupId = result.insertId;

    await dbPool.execute(
      `
        INSERT INTO accounts (group_id, user_id)
        VALUES (?, ?)
      `,
      [groupId, userId]
    );

    return res.status(201).send({ message: 'Group created successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

router.get('/groups', authenticate, async (req, res) => {
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

module.exports = router;
