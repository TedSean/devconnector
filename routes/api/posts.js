const express = require('express');
const router = express.Router();


//you just have to pass the endpoint as test as /api/users is already specified in server.js
router.get('/test', (req, res) => { 
  res.json({msg: 'posts works!'})
})

module.exports = router;