const express = require('express');
const mongoose = require('mongoose');
const app = express();

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

//DB Config
const db = require('./config/keys').mongoURI;

//DB Connection
mongoose
   .connect(db)
   .then(() => console.log('DB Connected Successfully'))
   .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World')
});


//First argument in app.use is to specify the initial route
app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profile', profile);

const port = process.env.port || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});