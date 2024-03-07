const express = require('express');
const app = express();
app.use(express.json());

const axios = require('axios');
const cookieParser = require('cookie-parser');
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


const db_query = require('./database/connection');

const { addSeller, update_user, set_seller} = require('./database/Query/Customer_query');



const path = require('path');
const { lowerCase, isNumber, result, get } = require('lodash');
const { log } = require('console');


// const UserRoute= require('./routes/User');
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', 'public/pages/');
app.use(express.static('./public'));  
// app.use('/user', UserRoute);
// app.use('/',router);
app.get('/user/:userid/search', async (req, res) => {

    const token1= await req.cookies.token;
    log(req.cookies);
    log(getUserToken(token1))
    const token = getUserToken(token1);

    if (token1===undefined || token1===null  ||token==null || token.id!=req.params.userid )
    {
        res.redirect('/login');
        return;

    }
    console.log(token.name);
    // console.log('get request');
    const name= (req.query.search);
    log(name);
    const result = await Search_products_by_name(name);
    console.log(result);


// if (result.length<1)
// {   
//     res.json({Product_error: '404'});
//     return;
// }
    const products =  await set_products(result);

    res.render('Search', { products: products , userid: req.params.userid, Name: token.name});

    return;
});


app.get('/test', async (req, res) => {
    res.render('Order');
}   
);

app.get('/user/:userid/catagory/:catid', async (req, res) => {
    const token1= await req.cookies.token;
    log(req.cookies);
    log(getUserToken(token1))
    const token = getUserToken(token1);
    
    // console.log('get request');
    const catid= (req.params.catid);
    const userid= (req.params.userid);
    var query= `SELECT * FROM PRODUCTS P LEFT JOIN CATAGORY C ON P.CATAGORY_ID=C.CATAGORY_ID JOIN SELLER_USER S ON S.SHOP_ID= P.SHOP_ID `
    +`WHERE P.CATAGORY_ID LIKE ${catid} ORDER BY PRODUCT_ID`;

    const params=[];
    const result= await db_query(query,params);
    
    const products =  await set_products(result);
    res.render('Search', { products: products , userid: userid});
    return;
}
);

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


app.get('/user/:userid/cart', async (req, res) => {
    console.log('get request cart');
    const id= (req.params.userid);
    let subquery= `SELECT SHOWCART(${id}) AS MAXIMUM FROM DUAL`;
    let CARTID= await db_query(subquery,[]);
    let cartid= CARTID[0].MAXIMUM;
    log(CARTID[0].MAXIMUM);
    if (CARTID.length<1) 
    {
        res.render('Cart', { products: [] , userid: id, cost: 0});
    }
    const query= `SELECT * FROM CART C JOIN PRODUCTS P ON C.PRODUCT_ID=P.PRODUCT_ID WHERE USER_ID = ${id} AND CART_ID = ${cartid}`;
    const params=[];
    const result= await db_query(query,params);
    // const products =  await set_products(result);
    let products = [];
    let total_cost=0;
    for (let i = 0; i < result.length; i++) {
        const product = {
            PRODUCT_ID: result[i].PRODUCT_ID,
            PRODUCT_NAME: result[i].PRODUCT_NAME,
            PRODUCT_PRICE: result[i].PRICE,
            PRODUCT_IMAGE: result[i].PRODUCT_IMAGE,
            CATAGORY_NAME: result[i].CATAGORY_NAME,
            SHOP_NAME: result[i].SHOP_NAME,
            SHOP_ID: result[i].SHOP_ID,
            QUANTITY: result[i].QUANTITY
        };
        total_cost+=product.PRODUCT_PRICE*product.QUANTITY;
        products.push(product);
    }
    res.render('Cart', { products: products , userid: id, cost: total_cost, cartid: cartid});
    return;
}
);

app.post('/user/:userid/addCart/:productid', async (req, res) => {
    console.log('Cart Post');
    const productid= req.params.productid;
    const quantity= 1;
    const id= (req.params.userid);
    var query= `
    BEGIN
        ADDTOCART(${id},${productid});
    END;
    `;
    const params=[];
    const result = await db_query(query,params);
    log('user/'+id+'/addCart/'+productid);
    res.json({ productid: productid, success : true });
});

app.get('/user/:userid/deleteCart/:productid', async (req, res) => {
    console.log('Cart Delete '+ req.params.userid + ' ' + req.params.productid);
    const productid= req.params.productid;
    const id= (req.params.userid);
    var subquery= `SELECT MAX(CART_ID) AS MAXIMUM FROM CART WHERE USER_ID = ${id}`;
    var CARTID= await db_query(subquery,[]);
    var cartid= CARTID[0].MAXIMUM;
    var query= `DELETE FROM CART WHERE USER_ID = ${id} AND PRODUCT_ID = ${productid} AND CART_ID = ${cartid}`;
    const params=[];
    const result = await db_query(query,params);
    res.json({ productid: productid, success : true  });
});




app.post('/user/:userid/updateCart', async (req, res) => {
    console.log('Cart Update');
    const productid= req.body.productid;
    let quantity= parseInt(req.body.quantity); 
    let typef= parseInt(req.body.type);
    const id= (req.params.userid); 
    var update= 1;
    if (typef==1) update=-1;
    const params=[];
    console.log(req.body);
    var query = `
    BEGIN
        UPDATECART(${id},${productid},${quantity},${update});

        END;`
        const result = await db_query(query,params);
        res.json({ productid: productid, quantity: quantity+1, success : true });
    });


    app.get('/user/:userid/confirmation', async (req, res) => {
        console.log('Confirmation Get');
        const orderid = req.query.orderid;

        const query= `SELECT 
        O.ORDER_ID, 
        O.TOTAL_PRICE,
        O.PAYMENT_TYPE,
        O.DELIVERY_STATUS,
        P.PRODUCT_NAME,
        P.PRICE,
        P.PRODUCT_IMAGE,
        S.SHOP_NAME,
        S.SHOP_ID,
        O.CONFIRMATION_TIME,
        O.USER_ID

        FROM ORDERS O JOIN PRODUCTS P ON O.PRODUCT_ID=P.PRODUCT_ID JOIN SELLER_USER S ON S.SHOP_ID= P.SHOP_ID WHERE O.ORDER_ID = ${orderid}`;
        const params=[];
        const result= await db_query(query,params);
        if ( result.length<1)
        {
            res.json({ success: false, order : {} });
            return;
        }
        var id = req.params.userid;
        var order = [];
        for (let i = 0; i < result.length; i++) {
            const product = {
                ORDER_ID: result[i].ORDER_ID,
                PRODUCT_NAME: result[i].PRODUCT_NAME,
                PRODUCT_PRICE: result[i].PRICE,
                PRODUCT_IMAGE: result[i].PRODUCT_IMAGE,
                SHOP_NAME: result[i].SHOP_NAME,
                SHOP_ID: result[i].SHOP_ID,
                TOTAL_PRICE: result[i].TOTAL_PRICE,
                PAYMENT_TYPE: result[i].PAYMENT_TYPE,
                DELIVERY_STATUS: result[i].DELIVERY_STATUS,
                CONFIRMATION_TIME: result[i].CONFIRMATION_TIME
            };
            order.push(product);
        }
        console.log(order);
        res.json({ success: true, order : order });

    });
        
    
    app.post('/user/:userid/checkout', async (req, res) => {
        // res.redirect(`/user/1`);
        // return;
        console.log('Checkout Post');
        const id= (req.params.userid);
        var payment_type = req.body.payment_type;
        var subquery= `SELECT SHOWCART(${id}) AS MAXIMUM FROM DUAL`;
        var CARTID= await db_query(subquery,[]);
        var cartid= CARTID[0].MAXIMUM;
        console.log("cart id " + cartid);
        console.log(payment_type);
        if (cartid==0)
        {
            res.redirect(`/user/${id}/cart`);
            return;
        }
        if (payment_type==undefined)
        {
            console.log('payment type undefined');
            payment_type='CREDIT';
        }
        var query= `
            DECLARE
                CART_ID NUMBER;
                NUM NUMBER;
            BEGIN
                CART_ID:= SHOWCART(${id});
                NUM := CONFIRM_ORDER(CART_ID, ${id}, UPPER('${payment_type}'));
            END;
    
        `
        const params=[];
        console.log(query);
        console.log(payment_type);
        const result = await db_query(query,params);
        console.log(result);
        var order = await axios.get(`http://localhost:5000/user/${id}/confirmation?orderid=${cartid}`).then(response => {
            const order=response.data.order;
            console.log(order);
            res.render('Order', { order: order , userid: id});
            return;
        })
        .catch(error => {
            console.log(error);
        });

    } );


    app.get('/user/:userid/checkout', async (req, res) => {
    console.log('Checkout Get');
    const id= (req.params.userid);
    // console.log(cart_id);
    var sub_query= `
    SELECT SHOWCART(${id}) AS MAXIMUM FROM DUAL`;
    
    var CARTID= await db_query(sub_query,[]);
    var cart_id= CARTID[0].MAXIMUM;
    
    var query= `
	SELECT P.PRODUCT_ID, 
    P.PRODUCT_NAME,
    P.PRICE,
    P.PRODUCT_IMAGE,
    C.QUANTITY,
    C.CART_ID,
    S.SHOP_NAME,
    S.SHOP_ID,
    P.STOCK_QUANTITY,
    (P.PRICE*C.QUANTITY) AS COST,
    (P.PRICE*C.QUANTITY)*(1-NVL((SELECT DISCOUNT_AMOUNT FROM DISCOUNTS WHERE PROMO_CODE = P.PROMO_CODE),0)/100) AS DISCOUNTED_COST,
    NVL((SELECT DISCOUNT_AMOUNT FROM DISCOUNTS WHERE PROMO_CODE = P.PROMO_CODE),0) AS DISCOUNT,
    NVL(P.PROMO_CODE,'NULL') AS PROMO_CODE
     FROM CART C JOIN PRODUCTS P ON C.PRODUCT_ID=P.PRODUCT_ID JOIN SELLER_USER S ON S.SHOP_ID= P.SHOP_ID WHERE C.USER_ID = ${id} AND C.CART_ID = ${cart_id}`;
    const result= await db_query(query,[]);
    // console.log(result);
    let products = [];
    let total_cost=0;
    let discounted_cost=0;
    for (let i = 0; i < result.length; i++) {
        const product = {
            PRODUCT_ID: result[i].PRODUCT_ID,
            PRODUCT_NAME: result[i].PRODUCT_NAME,
            PRODUCT_PRICE: result[i].PRICE,
            PRODUCT_IMAGE: result[i].PRODUCT_IMAGE,
            CATAGORY_NAME: result[i].CATAGORY_NAME,
            SHOP_NAME: result[i].SHOP_NAME,
            SHOP_ID: result[i].SHOP_ID,
            QUANTITY: result[i].QUANTITY,
            COST: result[i].COST,
            DISCOUNTED_COST: result[i].DISCOUNTED_COST,
            CART_ID: result[i].CART_ID,
            DISCOUNT: result[i].DISCOUNT,
            PROMO_CODE: result[i].PROMO_CODE,
            STOCK_QUANTITY: result[i].STOCK_QUANTITY
        };
        total_cost+=product.PRODUCT_PRICE*product.QUANTITY;
        discounted_cost+=product.DISCOUNTED_COST;
        products.push(product);
    }
    console.log("hi");
   var user_query = `SELECT * FROM CUSTOMER_USER C JOIN ADDRESS A ON C.USER_ID=A.USER_ID WHERE C.USER_ID = ${id}`;
    var user_result = await db_query(user_query,[]);
    // console.log(user_result);
    var user ={
        NAME: user_result[0].NAME,
        EMAIL: user_result[0].EMAIL,
        PHONE: user_result[0].PHONE,
        STREET: user_result[0].STREET_NAME,
        POSTAL_CODE: user_result[0].POSTAL_CODE,
        CITY: user_result[0].CITY,
        DIVISION: user_result[0].DIVISION,
        COUNTRY : user_result[0].COUNTRY

    };
    // res.render('test');
    res.render('Checkout', { userid: id, products: products, cost: total_cost, cartid: cart_id, discounted_cost: discounted_cost, user: user});
}
);





app.post('/user/:userid/cart', async (req, res) => {
    console.log("Cart Post");
    const productid= req.body.productid;
    // const quantity= req.body.quantity;
    const quantity= 1;
    var subquery = ' SELECT * FROM CART WHERE USER_ID = '+req.params.userid+' AND PRODUCT_ID = '+productid;
    var subresult = await db_query(subquery,[]);
    if (subresult.length>0)
    {
        log("hi");
        subquery = 'SELECT NVL(MAX(CART_ID),0) AS MAXIMUM FROM CART WHERE USER_ID = '+req.params.userid;
        subresult = await db_query(subquery,[]);
        var cartid= subresult[0].MAXIMUM;
        subquery= 'UPDATE CART SET QUANTITY = QUANTITY + 1 WHERE USER_ID = '+req.params.userid+' AND PRODUCT_ID = '+productid + ' AND CART_ID = '+cartid;
        subresult = await db_query(subquery,[]);
        res.redirect(`/user/${req.params.userid}/cart`);
        return;
    }
    log(productid);
    log(quantity);
    const id= (req.params.userid);
    // log(productid);
    res.redirect(`/user/${id}/addCart/${productid}`);

});
 


app.post('/review', async (req, res) => {
    console.log('Review Post');
    const { productid, rating, review } = req.body;
    console.log(req.body);
    var query= `INSERT INTO REVIEWS (USER_ID, PRODUCT_ID, RATING, REVIEW) VALUES (${userid}, ${productid}, ${rating}, '${review}')`;
    const params=[];
    const result= await db_query(query,params);
    res.json({ success: true });
}
);
// app.get('')

app.get('/user/:userid/product/:id/review', async (req, res) => {
    console.log('get request review');
    const id= (req.params.id);
    const userid= (req.params.userid);
    const query= `SELECT * FROM REVIEWS R JOIN CUSTOMER_USER C ON R.USER_ID=C.USER_ID WHERE PRODUCT_ID = ${id}`;
    const params=[];
    const result= await db_query(query,params);
    // console.log(result);
    let reviews = [];
    for (let i = 0; i < result.length; i++) {
        const review = {
            USER_ID: result[i].USER_ID,
            NAME: result[i].NAME,
            RATING: result[i].RATING,
            REVIEW: result[i].REVIEW
        };
        reviews.push(review);
    }
    res.json(reviews);
    return;
}
);
 


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
    
    const userid= (req.params.userid);
    const token1= await req.cookies.token;
    log(req.cookies);
    log(getUserToken(token1))
    const token = getUserToken(token1);

    if (token1===undefined || token1===null  ||token==null || token.id!=userid )
    {
        res.redirect('/login');
        return;

    }
    console.log(token.name);

    console.log('get request filter');
    const { priceUnder, categoryId } = req.query;
    console.log(priceUnder);
    console.log(categoryId);
    // Filtering logic based on your requirements
    let filtered_products = await Filter_Products(priceUnder, categoryId);
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
            SHOP_ID: filtered_products[i].SHOP_ID,
            PRODUCT_STOCK: filtered_products[i].STOCK_QUANTITY
        };
        // console.log(product.PRODUCT_PRICE);
        products.push(product);
    }

    // console.log(products);
    log("hi")
    // console.log(products);
    res.render('filter', { products: products, userid : userid , link: "user/"+userid , PU : priceUnder, CatID : categoryId, Name : token.name});   
    // res.json(products);

});


app.get('/order/:userid', async (req, res) => {
 
    console.log('get request order');
    const userid= (req.params.userid);
    const query= `SELECT 
    O.ORDER_ID, O.DELIVERY_STATUS,
    P.PRODUCT_NAME,
    (
        SELECT 
            QUANTITY 
        FROM 
            CART C 
        WHERE 
            O.ORDER_ID = C.CART_ID 
            AND O.PRODUCT_ID = C.PRODUCT_ID
    ) AS QUANTITY,
    O.TOTAL_PRICE,
    O.PAYMENT_TYPE,
    (SELECT PROFILE_PICTURE FROM CUSTOMER_USER CUS WHERE O.USER_ID = CUS.USER_ID) AS PROFILE_PICTURE
FROM 
    ORDERS O 
JOIN 
    PRODUCTS P 
ON 
    O.PRODUCT_ID = P.PRODUCT_ID
WHERE 
     O.USER_ID = :userid
`; 

    const params = {
        userid: req.params.userid
    };
 
    const orderHistory = await db_query(query,params); 
    console.log(orderHistory);
    res.render('customerOrderHistory', { USER_ID: req.params.userid , orderHistory: orderHistory });
    return;
}
);


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


const {authorize, Seller_authorize,setUserToken, getUserToken} = require('./database/Query/LoginAuthorization');
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
    console.log(user_name);
    const phone = result[0].PHONE;
    // console.log(phone);
    const token1= await req.cookies.token;
    log(req.cookies);
    log(getUserToken(token1))
    const token = getUserToken(token1);

    if (token1===undefined || token1===null  ||token==null || token.id!=id )
    {
        res.redirect('/login');
        return;

    }
    const products = await axios.get(`http://localhost:5000/products/all`).then(response => {
        const products=response.data;
        const cat =  axios.get(`http://localhost:5000/categories`).then(response => {
            const categories=response.data;
            const arr= { Name: user_name, Phone : phone , userID: id, link: '/user/'+id, products: products, categories: categories};
            res.render('HomeTest', arr);
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
    const token1= await req.cookies.token;
    log(req.cookies);
    res.clearCookie('token');
    res.clearCookie('loggedin');

    res.clearCookie('userid');

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
        const token1= await req.cookies;
        log(token1);
        const token = await setUserToken(r[0].USER_ID, r[0].NAME, r[0].EMAIL, r[0].PHONE);
        console.log(token);
        res.cookie('token', token);
        res.cookie('loggedin', true);
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


