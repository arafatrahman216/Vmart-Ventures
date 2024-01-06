const morgan = require('morgan');
const express = require('express');
const app = express();
// const router= require('express-promise-router')();
const router= express.Router();
const cors = require('cors'); 
app.use(express.static('public'));
router.use(cors());
app.use(cors());
app.options('*', cors());
app.set('view engine', 'ejs');
app.set('views', 'public/pages');
app.use(morgan('dev'));
app.use(express.json());
app.use('/',router);
// app.use(express.static('public'));  
app.use(express.urlencoded({ extended: false }));


const db_query= require('./database/connection');
const path = require('path');
const { lowerCase } = require('lodash');


let authorized=0;
var user_name="";
const authorize= async (email, password)=>{
    
    if (email==="" || password==="") return false;
    const query= `SELECT * FROM HR.CUSTOMER_USER WHERE EMAIL LIKE \'${email}\' AND PASSWORD LIKE\'${password}\'`;
    const params=[];
    const result= await db_query(query,params); 
    if(result){
        var {NAME}= result.row[0];
        user_name=NAME;
        authorized=2;//authorized
        return true;
    }
    else{
        authorized=1; //unauthorized
        console.log(Date.now());
        console.log(user_name);
        console.log(password);
        return false;
    }
}
app.post('/employee/result', async (req, res) => {
    if (authorized===1)
    {
        res.status(401).send(`<h1> Unauthorized Access Blocked</h1>`);
        authorized=0;
    }
    else if (authorized===2){
        res.status(200).send(`<h1> Hello ${user_name}</h1>`);
        authorized=0;
    }
});

app.get('/employee/all/:id', async (req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    // res.sendFile(filePath);
    // console.log(req.query.username);
    const id= (req.params.id);
    console.log(id);
    const query= `SELECT * FROM HR.EMPLOYEES WHERE EMPLOYEE_ID=${id}`;
    const params=[];
    const result= await db_query(query,params);
    const new_result=result.map((item)=>{
        return {
            "EMPLOYEE_ID": item.EMPLOYEE_ID,
            "FULL_NAME": item.FIRST_NAME+" "+item.LAST_NAME,
            "EMAIL": lowerCase(item.EMAIL)+"@gmail.com",
            "PHONE_NUMBER": item.PHONE_NUMBER,
            "DEPARTMENT_ID": item.DEPARTMENT_ID
        }
    }
    );
    if (result) res.send({result: new_result});
    else res.status(404).send(`<h1> Employee with id ${id} not found </h1>`);
    // res.status(200).sendFile(filePath);
    // res.send();
    console.log(result);
});
app.get('/employee/login', async (req, res) => {
        const filePath = path.join(__dirname, 'index.html');
        // console.log(req.body);
        console.log(req.query);
        // res.sendFile(filePath);
        res.render('index', { title: 'Hey', message: 'Hello there!' })
        if (req.query.username==null || req.query.password==null) {
            console.log("null");
            return;
        }
        // if (req.query.username==="" || req.query.password==="") return;
        authorize(req.query.username,req.query.password);
        console.log(authorized);
        console.log('hi');
    }
);
// app.post('/employee/login', async (req, res) => {
//     console.log(req.body);
//     const filePath = path.join(__dirname, 'index.html');
//     console.log('hello');
//     console.log(req.body);
//     res.sendFile(filePath,`taken`);
//     // res.sendFile(filePath);
// });



app.listen(5000, () => {
    console.log('Server on port 5000');
});

module.exports= db_query;