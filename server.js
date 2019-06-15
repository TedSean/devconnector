const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const app = express();


//body parser
//extended false means you can not post nested object
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


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


//Passport middleware

app.use(passport.initialize());

//Passport config
require('./config/passport')(passport);


//First argument in app.use is to specify the initial route
app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profile', profile);

const port = process.env.port || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});