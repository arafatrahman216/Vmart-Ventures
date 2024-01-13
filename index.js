const express = require('express');
const app = express();
const router= express.Router();
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', 'public/pages/');
app.use(express.static('./public'));  
app.use('/',router);

const db_query= require('./database/connection');


const path = require('path');
const { lowerCase } = require('lodash');
const { log } = require('console');

const {authorize, Seller_authorize} = require('./database/Query/LoginAuthorization');
const {addCustomer, query_checker} = require('./database/Query/Customer_query');


app.get('/login', async (req, res) => {
    res.render('index', { ctoken : 'unauthorized', stoken : 'unauthorized' })
}
);

app.post('/seller_authorize', async (req, res)=>
{
    console.log('post request');
        console.log(req.body.username2);
        console.log(req.body.password2);
        var email=req.body.username2;
        var password=req.body.password2;
        var r= await Seller_authorize(email,password);
        console.log(r.length);
        if (r.length>0) 
        {
            console.log('OK');
            var linkurl='/user/'+r[0].USER_ID;
            res.render('home', { Name: r[0].NAME, Phone : r[0].PHONE_NUMBER , userID: r[0].USER_ID, link: linkurl});
            return;
        }
        else res.render('index', { ctoken : 'unauthorized', stoken : 'blocked' }) ;
        console.log('not ok');
    }

    );
    
app.get('/user/:userid', async (req, res) => {
    console.log('get request');
    const id= (req.params.userid);
    console.log(id);
    const query= `SELECT * FROM CUSTOMER_USER WHERE USER_ID LIKE ${id}`; 
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



app.post('/authorize', async (req, res) => {
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
        var linkurl='/user/'+r[0].USER_ID;
        res.render('home', { Name: r[0].NAME, Phone : r[0].PHONE , userID: r[0].USER_ID, link: linkurl});
        return;
    }
    else res.render('index', { ctoken : 'blocked', stoken : 'unauthorized' }) ;
    console.log('not ok');
});

  
app.get('/signup' , async(req ,res) => {
    log('get request user signup');
    
    res.render('signup');    
}); 
app.post('/signup', async (req, res) => {
    console.log(req.body); 
    const {name, email,phone,password,gender,dob }= req.body;
    // console.log(name);
    // console.log(email);
    // console.log(phone);
    // console.log(password); 
    // console.log(gender);
    // console.log(dob);
    const userid= await addCustomer(name, email,phone, password,gender,dob);
    console.log('userid post signup');
    console.log(userid);
    res.render('home', { Name: req.body.name, Phone : req.body.phone , userID: req.body.userid, link: '/user/'+userid});
}
);

app.listen(5000, () => {
    console.log('Server on port 5000');
});

module.exports= db_query;


//body parser for body data
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// router.use(bodyParser.json());

// const morgan = require('morgan');
// app.use(morgan('tiny'));
// app.use(express.json());

// router.get('/all/:id', async (req, res) => {
//     const filePath = path.join(__dirname, 'index.html');
//     // res.sendFile(filePath);
//     // console.log(req.query.username);
//     const id= (req.params.id);
//     console.log(id);
//     const query= `SELECT * FROM HR.EMPLOYEES WHERE EMPLOYEE_ID=${id}`;
//     const params=[];
//     const result= await db_query(query,params);
//     const new_result=result.map((item)=>{
//         return {
//             "EMPLOYEE_ID": item.EMPLOYEE_ID,
//             "FULL_NAME": item.FIRST_NAME+" "+item.LAST_NAME,
//             "EMAIL": lowerCase(item.EMAIL)+"@gmail.com",
//             "PHONE_NUMBER": item.PHONE_NUMBER,
//             "DEPARTMENT_ID": item.DEPARTMENT_ID
//         }
//     }
//     );
//     if (result) res.status(200).json(new_result)
//     else res.status(404).send(`<h1> Employee with id ${id} not found </h1>`);
//     // res.status(200).sendFile(filePath);
//     // res.send();
//     console.log(result);
// });