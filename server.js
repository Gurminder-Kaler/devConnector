const express = require('express');
const app = express();

app.get('/', () => res.send('Hellow'));

const port = process.env.port || 5000;

app.listen(port, () => console.log( `Server running on port ${port}`));
