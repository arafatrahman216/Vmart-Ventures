    
const express = require('express');
const router = express.Router();
const axios = require('axios');
const db_query= require('../database/connection');

const {
    update_user, 
    Filter_Products, 
    set_products,
    Search_products_by_name
    } = require('../database/Query/Customer_query');


router.get('/:userid', async (req, res) => {

    console.log('get request');
    const id= (req.params.userid);
    console.log(id);
    const query= `SELECT * FROM CUSTOMER_USER WHERE USER_ID LIKE :userid`;
    const params= {userid: id}
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
    res.render('profile', 
    {   Name: user_name, 
        Phone : phone ,
        userID: id, 
        gender : Gender,
        email : result[0].EMAIL, dob : result[0].DATE_OF_BIRTH
    });
    return;
});


router.post('/:userid', async (req, res) => {
 
    console.log("Profile Post");
    const id= (req.params.userid);
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;
    update_user(id, name, email, phone);
    res.redirect(`/user/${req.params.userid}`);
});
 


router.get('/:userid/product/:id', async (req, res) => {
    // console.log('get request');
    const id= (req.params.id);
    const userid= (req.params.userid);
    
    const result = await axios.get(`http://localhost:5000/products/${id}`).then(response => {
        const product=response.data;
        res.render('product', { product: product , userid: userid});
        return;
    })
    .catch(error => {
        console.log(error);
    });
});

router.get('/:userid/search/product/:name', async (req, res) => {
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
    if (result.length==1) res.redirect(`user/`+ req.params.userid +`/product/${products[0].PRODUCT_ID}`);
    else
    {
        res.render('filter', { products: products , userid: req.params.userid});
    }
    return;
});



router.get('/:userid/filter', async (req, res) => { 
    console.log('get request filter');
    const userid= (req.params.userid);
    const { priceUnder5000, categoryId } = req.query;
    console.log(priceUnder5000);
    console.log(categoryId);
    // Filtering logic based on your requirements
    let filtered_products = await Filter_Products(priceUnder5000, categoryId);
    let products = await set_products(filtered_products);
    console.log(products);
    res.render('filter', { products: products, userid: userid });   
});



module.exports = router;