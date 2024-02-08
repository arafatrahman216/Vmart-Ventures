const express = require('express');
const app = express();
const axios = require('axios');
const router= express.Router();
const session = require('express-session');
app.use(express.urlencoded({ extended: true }));
const { Server } = require('socket.io');


app.set('view engine', 'ejs');
app.set('views', 'public/pages/');
app.use(express.static('./public'));  
app.use('/',router);

const db_query= require('./database/connection');


const path = require('path');
const { lowerCase, isNumber, result, get } = require('lodash');
const { log } = require('console');


const UserRoute= require('./routes/User');
app.use('/user', UserRoute);

const {authorize, Seller_authorize} = require('./database/Query/LoginAuthorization');
const {
        addCustomer,
        query_checker, 
        set_products,
        Filter_Products,
        get_products, 
        Search_products_by_name,
        get_user
    } = require('./database/Query/Customer_query');


app.get('/categories',  async (req, res) => { 
    console.log('get request');
    const query= `SELECT * FROM CATAGORY`; 
    const params=[];
    const result= await db_query(query,params); 
    if (result.length<1)
    {
        res.json({Product_error: '404'});
        return;
    }
    const categories = [];
    for (let i = 0; i < result.length; i++) {
        const category = {
            CATEGORY_ID: result[i].CATAGORY_ID,
            CATEGORY_NAME: result[i].CATAGORY_NAME,
        };
        categories.push(category);
    }
    res.json(categories);
    return;
}
);



app.get('/home/:userid', async (req, res) => {
    console.log('get request');
    const id= (req.params.userid);
    const result = await get_user(id);
    const user_name=result[0].NAME;
    console.log(user_name);
    
    const phone = result[0].PHONE;
    console.log(phone);
    const products = await axios.get(`http://localhost:5000/products/all`).then(response => {
        const products=response.data;
        const cat =  axios.get(`http://localhost:5000/categories`).then(response => {
            const categories=response.data;
            const arr= { Name: user_name, Phone : phone , userID: id, link: '/user/'+id, products: products, categories: categories};
            res.render('home', arr);
            return;
        })
        .catch(error => {
            console.log(error);
        });
    })
    .catch(error => {
        console.log(error);
    });
} );


app.get('/products/:id', async (req, res) => {
    // console.log('get request');
    const id= (req.params.id);
    
    const result = await get_products(id);
    // console.log(result.length);
    if (result.length<1)
    {
        res.json({Product_error: '404'});
        return;
    }
    const products =  await set_products(result);
    res.json(products);
    return;
}
);






app.get('/login', async (req, res) => {
    res.render('index', { ctoken : 'unauthorized', stoken : 'unauthorized' })
});

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

            res.render('ShopOwnerProfile', { SHOP_ID: r[0].SHOP_ID, PHONE : r[0].PHONE, EMAIL : r[0].EMAIL , SHOP_NAME: r[0].SHOP_NAME , SHOP_LOGO : r[0].SHOP_LOGO , DESCRIPTION: r[0].DESCRIPTION ,TOTAL_REVENUE : r[0].TOTAL_REVENUE});
            return;
        }

        else res.render('index', { ctoken : 'unauthorized', stoken : 'blocked' }) ;
        console.log('not ok');
    }

);











app.post('/login', async (req, res) => {
    var email=req.body.username;
    var password=req.body.password;
    console.log(req.body);
    var r= await authorize(email,password);
    // console.log(r.length);
    if (r.length>0) 
    {
        console.log('OK');
        var homeurl='/home/'+r[0].USER_ID;
        res.redirect(homeurl);
        return;


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
    // res.render('home', { Name: req.body.name, Phone : req.body.phone , userID: req.body.userid, link: '/user/'+userid});
    res.redirect('/home/'+userid);
});

app.listen(5000, () => {
    console.log('Server on port 5000');
});

module.exports= db_query;


