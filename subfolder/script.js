const express = require('express');
const router= require('express-promise-router')();

const path = require('path');

const app = express();
app.use(express.json());
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'login.html');
    const stylePath = path.join(__dirname, 'style.css');
    res.sendFile(filePath, stylePath);
    console.log(req.body);
}
);
app.post('/', (req, res) => {
    const filePath = path.join(__dirname, 'login.html');
    const stylePath = path.join(__dirname, 'style.css');
    res.sendFile(filePath, stylePath);
    console.log(req.body);
    console.log(req.body.username);
}
);
app.listen(3000, () => {
    console.log('Server on port 3000');
});
