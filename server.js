const express = require('express');
const app = express();
const mongoose = require('mongoose');
const db = require('./config/keys').mongoURI;
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

// connect to mongoDb
mongoose
.connect(db)
.then ( ()=> console.log('MongoDb Connected'))
.catch (err => console.log(err));

app.get('/', (req, res) => res.send('Hello2'));

// use Routes

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.port || 5000;

app.listen(port, () => console.log( `Server running on port ${port}`));
