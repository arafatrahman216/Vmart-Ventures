const express = require('express');
const app = express();
const axios = require('axios');
const router= express.Router();
app.use(express.urlencoded({ extended: true }));
 
app.set('view engine', 'ejs');
app.set('views', 'public/pages/');
app.use(express.static('./public'));  
app.use('/',router);
app.use(express.json());
 
const db_query= require('./database/connection');
 
 
const path = require('path');
const { lowerCase, isNumber } = require('lodash');
const { log } = require('console');

const {authorize, Seller_authorize} = require('./database/Query/LoginAuthorization');
const {addCustomer, query_checker} = require('./database/Query/Customer_query');

//////get catagories
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

//get filters
app.get('/filter', async (req, res) => { 
    const { priceUnder5000, categoryId } = req.query;
    console.log(priceUnder5000);
    console.log(categoryId);

    // Filtering logic based on your requirements
    let query= ``;
    if (categoryId) {
        // Apply category filter logic here based on the provided categoryId
        query= `SELECT P.PRODUCT_ID, P.PRODUCT_NAME, P.PRICE, P.PRODUCT_IMAGE, C.CATAGORY_NAME, S.SHOP_NAME, S.SHOP_ID`
        +` FROM PRODUCTS P LEFT JOIN CATAGORY C ON P.CATAGORY_ID=C.CATAGORY_ID JOIN SELLER_USER S ON S.SHOP_ID= P.SHOP_ID`+
        ` WHERE P.CATAGORY_ID LIKE ${categoryId}`
    }
    
    if (priceUnder5000 === 'true') {
        // query= `SELECT * FROM CUSTOMER_USER `;
        let union_query= `SELECT P.PRODUCT_ID, P.PRODUCT_NAME, P.PRICE, P.PRODUCT_IMAGE, C.CATAGORY_NAME, S.SHOP_NAME, S.SHOP_ID`+
        ` FROM PRODUCTS P LEFT JOIN CATAGORY C ON P.CATAGORY_ID=C.CATAGORY_ID JOIN SELLER_USER S ON S.SHOP_ID= P.SHOP_ID`
        +` WHERE P.PRICE < 5000`    
        // query+= ` INTERSECTION ${union_query}`;
        if (categoryId) query+= ` INTERSECT ${union_query}`;
        else query+= union_query;
    }
    console.log(query);
    const params=[];
    let filtered_products = await db_query(query,params);

    let products = [];
    for (let i = 0; i < filtered_products.length; i++) {
        const product = {
            product_id: filtered_products[i].PRODUCT_ID,
            PRODUCT_NAME: filtered_products[i].PRODUCT_NAME,
            PRODUCT_PRICE: filtered_products[i].PRICE,
            product_stock: filtered_products[i].STOCK,
            product_description: filtered_products[i].DESCRIPTION,
            PRODUCT_IMAGE: filtered_products[i].PRODUCT_IMAGE,
            product_rating: filtered_products[i].RATING,
            product_catagory: filtered_products[i].CATAGORY_NAME,
            SHOP_NAME: filtered_products[i].SHOP_NAME,
            product_shop_id: filtered_products[i].SHOP_ID
        };
        products.push(product);
    }

    // Pass the filtered categories to the EJS template
    // res.json({CATAGORY_ID: 1, CATAGORY_NAME: 'Electronics'});
    // res.json(products);
    res.render('filter', { products: products });   
});


app.get('/products/:id', async (req, res) => {
    // console.log('get request');
    const id= (req.params.id);
    // console.log(id);
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
 
        console.log(req.body);
 
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


app.get('/user/:userid', async (req, res) => {
 
    const query= `SELECT * FROM CUSTOMER_USER WHERE USER_ID LIKE ${req.params.userid}`; 
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
                  
 
app.post('/user/:userid', async (req, res) => {
 
    console.log("Profile Post");
 
    const query = `UPDATE CUSTOMER_USER SET NAME = \'${req.body.name}\', PHONE = \'${req.body.phone}\', EMAIL = \'${req.body.email}\' WHERE USER_ID= ${req.params.userid} `;
    console.log(query);
    try {
        const result = await db_query(query, []);
    } catch (error) {
        console.error('Error updating data:', error);
    }
    res.redirect('/user/'+req.params.userid);

});
 
//after submitting login page
 
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
 
 
// app.post('/home', async (req, res) => {
 
//     var email=req.body.username;
//     var password=req.body.password;
 
//     var r= await authorize(email,password);
 
//     if (r.length>0) 
//     {
//         console.log('OK');
//         var linkurl='/user/'+r[0].USER_ID;
//         res.render('home', { Name: r[0].NAME, Phone : r[0].PHONE , userID: r[0].USER_ID, link: linkurl});
//         return;
//     }
 
//     else res.render('index', { ctoken : 'blocked', stoken : 'unauthorized' }) ;
 
//     console.log('not ok');
// });
 
 
app.get('/signup' , async(req ,res) => {
 
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
 
// working right now
 
app.get('/ShopOwnerSignup' , async(req ,res) => {
 
    res.render('ShopOwnerSignup');    
});
 
app.post('/ShopOwnerSignup', async (req, res) => {
 
    console.log(req.body);  
    //const {name, email, phone, shopname , street, postal_code,city, division , password , description }= req.body;
    const shopid= await addSeller( email, phone, shopname , street, postal_code,city, division , password , description);
    console.log('Shop Owner post signup');
    console.log(shopid);
    //res.render('home', { Name: req.body.name, Phone : req.body.phone , userID: req.body.userid, link: '/user/'+userid});
    res.render('ShopOwnerProfile' , {shopname: req.body.shopname , email: req.body.email , description: req.body.description , shopid: req.body.shopid , phone: req.body.phone , revenue: req.body.revenue});
}
 
);
 
 
app.get('/addproducts/:shopname/:shopid', async (req, res) => {
    const shopname = req.params.shopname;
    const shopid = req.params.shopid;
 
    res.render('SellerAddProducts', { shopname: shopname, shopid: shopid });
});
 
app.post('/addproducts/:shopname/:shopid', async (req, res) => {
    try {
 
 
      const { productname, productDescrip, productPrice, productQuantity, promoCode } = req.body;
      const shopname = req.params.shopname;
      const shopid = req.params.shopid;
 
      // Assuming you have a table named 'products' with appropriatecolumns
      const query = `
        INSERT INTO PRODUCTS (shopname, shopid, productname, productdescrip, productprice, productquantity, promocode)
        VALUES (:shopname, :shopid, :productname, :productdescrip, :productprice, :productquantity, :promocode)
      `;
 
      const params = {
        shopname,
        shopid,
        productname,
        productdescrip: productDescrip,
        productprice: productPrice,
        productquantity: productQuantity,
        promocode: promoCode
      };
 
      const result = await db_query(sql, params);
 
      console.log("Product added successfully to the database");
      res.status(200).send("Product added successfully to the database");
    } catch (error) {
      console.error("Error adding product to the database:", error);
      res.status(500).send("Internal Server Error");
    }
  });
 
 
app.listen(5000, () => {
    console.log('Server on port 5000');
});
 
module.exports= db_query;