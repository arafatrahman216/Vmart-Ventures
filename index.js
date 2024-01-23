const express = require('express');
const app = express();
const axios = require('axios');
const router= express.Router();
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', 'public/pages/');
app.use(express.static('./public'));  
app.use('/',router);

const db_query= require('./database/connection');


const path = require('path');
const { lowerCase, isNumber } = require('lodash');
const { log } = require('console');


const {authorize, Seller_authorize} = require('./database/Query/LoginAuthorization');
const {addCustomer, query_checker} = require('./database/Query/Customer_query');


app.get('/products/:id', async (req, res) => {
    console.log('get request');
    const id= (req.params.id);
    console.log(id);
    var query= `SELECT * FROM PRODUCTS P LEFT JOIN CATAGORY C ON P.CATAGORY_ID=C.CATAGORY_ID JOIN SELLER_USER S ON S.SHOP_ID= P.SHOP_ID `
    +`WHERE P.PRODUCT_ID LIKE ${id}`;   
    if (id=='all') query= `SELECT * FROM PRODUCTS P LEFT JOIN CATAGORY C ON P.CATAGORY_ID=C.CATAGORY_ID JOIN SELLER_USER S ON S.SHOP_ID= P.SHOP_ID `;
    const params=[];
    const result= await db_query(query,params); 
    // console.log(result.length);
    if (result.length<1)
    {
        res.json({Product_error: '404'});
        return;
    }
    const products = [];
    for (let i = 0; i < result.length; i++) {
        const product = {
            product_id: result[i].PRODUCT_ID,
            PRODUCT_NAME: result[i].PRODUCT_NAME,
            PRODUCT_PRICE: result[i].PRICE,
            product_stock: result[i].STOCK,
            product_description: result[i].DESCRIPTION,
            PRODUCT_IMAGE: result[i].PRODUCT_IMAGE,
            product_rating: result[i].RATING,
            product_catagory: result[i].CATAGORY_NAME,
            SHOP_NAME: result[i].SHOP_NAME,
            product_shop_id: result[i].SHOP_ID
        };
        products.push(product);
    }
    res.json(products);
    return;
}
);


app.get('/login', async (req, res) => {
    res.render('index', { ctoken : 'unauthorized', stoken : 'unauthorized' })
}
);
app.post('/seller_authorize', async (req, res)=>
{
    console.log('post request');

        var email=req.body.username2;
        var password=req.body.password2;

        var r = await Seller_authorize(email,password);


        if (r.length>0) 
        {
            console.log('OK');
            var linkurl='/seller/'+r[0].SHOP_NAME+'/'+r[0].SHOP_ID;

            res.render('SellerProfile', { SHOP_ID: r[0].SHOP_ID, PHONE : r[0].PHONE, EMAIL : r[0].EMAIL , SHOP_NAME: r[0].SHOP_NAME , SHOP_LOGO : r[0].SHOP_LOGO , DESCRIPTION: r[0].DESCRIPTION ,TOTAL_REVENUE : r[0].TOTAL_REVENUE});
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
    
    res.render('profile', { Name: user_name, Phone : phone , userID: id, gender : Gender, email : result[0].EMAIL, dob : result[0].DATE_OF_BIRTH});
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
        var products = [];
        const result= axios.get(`http://localhost:5000/products/all`).then(response => {
            products=response.data;
            console.log("logging things ");
            let arr= { Name: r[0].NAME, Phone : r[0].PHONE , userID: r[0].USER_ID, link: linkurl, products: products};
            console.log(arr);
            res.render('home', arr);
            // res.json({Name: r[0].NAME, Phone : r[0].PHONE , userID: r[0].USER_ID, link: linkurl, products: products})
            // res.json(arr);
            return;

        })

    }
    else res.render('index', { ctoken : 'blocked', stoken : 'unauthorized' }) ;
    console.log('not ok');
});

  
app.get('/signup' , async(req ,res) => {
    //log('get request user signup');
    
    res.render('signup');    
}); 
app.post('/signup', async (req, res) => {
    console.log(req.body);  
    const {name, e_mail,phone,password,gender,dob ,street, postal_code,city, division}= req.body;
    const userid= await addCustomer(name, e_mail,phone, password,gender,dob,street, postal_code,city, division);
    console.log('userid post signup');
    console.log(userid);
    res.render('home', { Name: req.body.name, Phone : req.body.phone , userID: req.body.userid, link: '/user/'+userid});
}
);

app.listen(5000, () => {
    console.log('Server on port 5000');
});

module.exports= db_query;


