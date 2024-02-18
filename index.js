const express = require('express');
const app = express();
const axios = require('axios');
// const router= express.Router();
const session = require('express-session');
app.use(express.urlencoded({ extended: true }));


const http = require('http');
const server= http.createServer(app);
const { Server } = require("socket.io");
const io= new Server(server);
io.on('connection',(socket)=>
{
    socket.on('time',(time)=>
    {
        io.emit('update',time);
    })
}
);

const db_query= require('./database/connection');

const { addSeller, update_user} = require('./database/Query/Customer_query');



const path = require('path');
const { lowerCase, isNumber, result, get } = require('lodash');
const { log } = require('console');


// const UserRoute= require('./routes/User');

app.set('view engine', 'ejs');
app.set('views', 'public/pages/');
app.use(express.static('./public'));  
// app.use('/user', UserRoute);
// app.use('/',router);

app.get('/user/:userid/search/', async (req, res) => {
// console.log('get request');
const name= (req.query.search);
log(name);
const result = await Search_products_by_name(name);
console.log(result);
if (result.length<1)
{   
    res.json({Product_error: '404'});
    return;
}
const products =  await set_products(result);

    res.render('Search', { products: products , userid: req.params.userid});

return;
});

app.get('/user/:userid', async (req, res) => {

    console.log('get request');
    const id= (req.params.userid);
    console.log(id);
    const query= "SELECT * FROM CUSTOMER_USER WHERE USER_ID = "+ id;
    const params=[];
    const result= await db_query(query,params);
    if (result===undefined || result.length<1)
    {
        res.send(`<h1> User with id ${id} not found </h1>`);
        return;
    }
    // res.json(result);
    // return;
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


app.post('/user/:userid', async (req, res) => {
 
    console.log("Profile Post");
    const id= (req.params.userid);
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;
    update_user(id, name, email, phone);
    res.redirect(`/user/${req.params.userid}`);
});
 


app.get('/user/:userid/product/:id', async (req, res) => {
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

app.get('/user/:userid/search/product/:name', async (req, res) => {
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


app.get('/user/:userid/filter', async (req, res) => { 
    console.log('get request filter');
    const userid= (req.params.userid);
    const { priceUnder5000, categoryId } = req.query;
    console.log(priceUnder5000);
    console.log(categoryId);
    // Filtering logic based on your requirements
    let filtered_products = await Filter_Products(priceUnder5000, categoryId);
    let products = [];
    // console.log(filtered_products);
    for (let i = 0; i < filtered_products.length; i++) {
        const product = {
            PRODUCT_ID: filtered_products[i].PRODUCT_ID,
            PRODUCT_NAME: filtered_products[i].PRODUCT_NAME,
            PRODUCT_PRICE: filtered_products[i].PRICE,
            PRODUCT_IMAGE: filtered_products[i].IMAGE,
            CATAGORY_NAME: filtered_products[i].CATAGORY_NAME,
            SHOP_NAME: filtered_products[i].SHOP_NAME,
            SHOP_ID: filtered_products[i].SHOP_ID
        };
        // console.log(product.PRODUCT_PRICE);
        products.push(product);
    }

    console.log(products);
    log("hi")
    // console.log(products);
    res.render('filter', { products: products, userid: "user/"+userid , PU5000 : priceUnder5000, CatID : categoryId});   
    // res.json(products);

});


app.get('/user/seller/:sellerid', async (req, res) => {
    // console.log('get request');
    const id= (req.params.sellerid);
    const result = await get_seller(id);
    // console.log(result.length);
    if (result.length<1)
    {
        res.json({Product_error: '404'});
        return;
    }
    console.log(result[0]);
    const seller = await set_seller(result[0]);

    // res.json(seller);
    res.render('ShopOwnerProfile', 
    { 
        SHOP_ID: seller.SHOP_ID, 
        SHOP_NAME: seller.SHOP_NAME, 
        PHONE: seller.PHONE, 
        EMAIL: seller.EMAIL, 
        DESCRIPTION: seller.DESCRIPTION,
        TOTAL_REVENUE: seller.TOTAL_REVENUE
    })
    return;
});


const {authorize, Seller_authorize} = require('./database/Query/LoginAuthorization');
const {
        addCustomer,
        query_checker, 
        set_products,
        Filter_Products,
        get_products, 
        Search_products_by_name,
        get_user,
        get_seller
    } = require('./database/Query/Customer_query');


app.get('/categories',  async (req, res) => { 
    console.log('get request cat');
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

      const { productname, productDescrip, productPrice, productQuantity, promoCode } = req.body;
      const shopname = req.params.shopname;
      const shopid = req.params.shopid;

      console.log(req.body);

    }
);



app.get('/home/:userid', async (req, res) => {
    // console.log('get request');
    const id= (req.params.userid);
    const result = await get_user(id);
    const user_name=result[0].NAME;
    // console.log(user_name);
    
    const phone = result[0].PHONE;
    // console.log(phone);
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
    const id = req.params.id;
    
    const result = await get_products(id); // Call the get_products function
    if ( result.length < 1) {
        res.json({ Product_error: '404' });
        return;
    }
    const products = await set_products(result);
    res.json(products);
    return;
});








app.get('/login', async (req, res) => {
    console.log('get request');
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
            var linkurl='/user/seller/'+r[0].SHOP_ID;

            res.redirect(linkurl);
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


