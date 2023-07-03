const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'password') {
    res.json({ success: true, message: 'Prisijungta sėkmingai' });
  } else {
    res.json({ success: false, message: 'Neteisingi prisijungimo duomenys' });
  }
});

router.post('/register', (req, res) => {
  const { username, password, email } = req.body;

  res.json({ success: true, message: 'Registracija sėkminga' });
});

module.exports = router;
