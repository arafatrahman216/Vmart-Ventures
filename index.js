const morgan = require('morgan');
const express = require('express');
const app = express();
const router= express.Router();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
// router.use(express.urlencoded({ extended: true }));

app.use(morgan('tiny'));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', 'public/pages/');
app.use(express.static('./public'));  
app.use('/',router);


const db_query= require('./database/connection');
const path = require('path');
const { lowerCase } = require('lodash');
const { log } = require('console');

var goto='employee/user/';

let authorized=0;
var user_name="";
const authorize= async (email, password)=>{
    
    const query= `SELECT * FROM HR.CUSTOMER_USER WHERE EMAIL LIKE \'${email}\' AND PASSWORD LIKE \'${password}\'`;
    const params=[];
    const r= await db_query(query,params);
    console.log(r);
    console.log(r.length);
    return r;
}

router.get('/employee/all/:id', async (req, res) => {
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
    if (result) res.status(200).json(new_result)
    else res.status(404).send(`<h1> Employee with id ${id} not found </h1>`);
    // res.status(200).sendFile(filePath);
    // res.send();
    console.log(result);
});
app.get('/employee/login', async (req, res) => {
        res.render('index', { token : 'unauthorized' })
        
    }
);

app.get('/employee/user/:userid', async (req, res) => {
    console.log('get request');
    console.log(goto);
    const id= (req.params.userid);
    console.log(id);
    const query= `SELECT * FROM HR.CUSTOMER_USER WHERE USER_ID=${id}`;
    const params=[];
    const result= await db_query(query,params);
    console.log(result.length);
    if (result.length<1)
    {
        res.send(`<h1> User with id ${id} not found </h1>`);
        return;
    }
    const user_name=result[0].NAME;
    console.log(user_name);
    const phone = result[0].PHONE_NUMBER;
    console.log(phone);
    const Gender = result[0].GENDER ;

    res.render('profile', { Name: user_name, Phone : phone , id: id, gender : Gender, email : result[0].EMAIL, dob : result[0].DATE_OF_BIRTH});
    return;
}
);



app.post('/employee/authorize', async (req, res) => {
    console.log('post request');
    console.log(req.body.username);
    console.log(req.body.password);
    var email=req.body.username;
    var password=req.body.password;
    var r= await authorize(email,password);
    console.log(r.length);
    if (r.length>0) 
    {
        console.log('OK');
        var linkurl='/employee/user/'+r[0].USER_ID;
        res.render('home', { Name: r[0].NAME, Phone : r[0].PHONE_NUMBER , userID: r[0].USER_ID, link: linkurl});
        return;
    }
    else res.render('index', { token : 'blocked' }) ;
    console.log('not ok');
    
});

app.listen(5000, () => {
    console.log('Server on port 3000');
});

module.exports= db_query;