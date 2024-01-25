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
const { lowerCase, isNumber, result, get } = require('lodash');
const { log } = require('console');


const {authorize, Seller_authorize} = require('./database/Query/LoginAuthorization');
const {addCustomer, query_checker, set_products,Filter_Products, get_products, Search_products_by_name} = require('./database/Query/Customer_query');

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

app.get('/filter', async (req, res) => { 
    const { priceUnder5000, categoryId } = req.query;
    console.log(priceUnder5000);
    console.log(categoryId);
    // Filtering logic based on your requirements
    let filtered_products = await Filter_Products(priceUnder5000, categoryId);
    let products = await set_products(filtered_products);
    console.log(products);
    res.render('filter', { products: products });   
});


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

app.get('/search/product/:name', async (req, res) => {
    // console.log('get request');
    const name= (req.params.name);
    const result = await Search_products_by_name(name);
    // console.log(result.length);
    if (result.length<1)
    {
        res.json({Product_error: '404'});
        return;
    }
    const products =  await set_products(result);
    if (result.length==1) res.redirect(`/product/${products[0].PRODUCT_ID}`);
    else
    {
        res.render('filter', { products: products });
    }
    return;
}
);



app.get('/product/:id', async (req, res) => {
    // console.log('get request');
    const id= (req.params.id);
    const result = await axios.get(`http://localhost:5000/products/${id}`).then(response => {
        const product=response.data;
        res.render('product', { product: product });
        return;
    })
    .catch(error => {
        console.log(error);
    });

});


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


app.post('/user/:userid', async (req, res) => {
 
    console.log("Profile Post");
 
    const query = `
        UPDATE CUSTOMER_USER 
        SET NAME = :name, PHONE = :phone, EMAIL = :email 
        WHERE USER_ID LIKE :userid
    `;
    const params = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        userId: req.params.userid
    };
 
    try {
        const result = await db_query(query, params);
    } catch (error) {
        console.error('Error updating data:', error);
    }
    
    res.redirect(`/user/${req.params.userid}`);
});
 
    
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

    const phone = result[0].PHONE;
    console.log(phone);

    const Gender = result[0].GENDER ;
    
    res.render('profile', { Name: user_name, Phone : phone , userID: id, gender : Gender, email : result[0].EMAIL, dob : result[0].DATE_OF_BIRTH});
    return;
}
);







app.post('/authorize', async (req, res) => {
    // console.log('post request');
    // console.log(req.body.username);
    // console.log(req.body.password);
    var email=req.body.username;
    var password=req.body.password;
    var r= await authorize(email,password);
    // console.log(r.length);
    if (r.length>0) 
    {
        console.log('OK');
        var linkurl='/user/'+r[0].USER_ID;
        var products = [];
        const result=  axios.get(`http://localhost:5000/products/all`).then(response => {
            products=response.data;
            const cat =  axios.get(`http://localhost:5000/categories`).then(response => {
                const categories=response.data;
                const arr= { Name: r[0].NAME, Phone : r[0].PHONE , userID: r[0].USER_ID, link: linkurl, products: products, categories: categories};
                // console.log(arr);
                res.render('home', arr);
                return;
            })
            .catch(error => {
                console.log(error);
            });
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
    // res.render('home', { Name: req.body.name, Phone : req.body.phone , userID: req.body.userid, link: '/user/'+userid});
    const result=  axios.get(`http://localhost:5000/products/all`).then(response => {
            products=response.data;
            const cat =  axios.get(`http://localhost:5000/categories`).then(response => {
                const categories=response.data;
                const arr= { Name: req.body.name, Phone : req.body.phone , userID: req.body.userid, link: '/user/'+userid, products: products, categories: categories};
                // console.log(arr);
                res.render('home', arr);
                return;
            })
            .catch(error => {
                console.log(error);
            });
        })
}
);

app.listen(5000, () => {
    console.log('Server on port 5000');
});

module.exports= db_query;


