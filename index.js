const express = require('express');
const app = express();
const router= express.Router();
app.use(express.urlencoded({ extended: true }));
 
app.set('view engine', 'ejs');
app.set('views', 'public/pages/');
app.use(express.static('./public'));  
app.use('/',router);
app.use(express.json());
 
const db_query= require('./database/connection');
const oracledb = require('oracledb');

 
const path = require('path');
const { lowerCase, get } = require('lodash');
const { log } = require('console');

// omi's code 
const bodyParser = require('body-parser');
app.use(bodyParser.json());
 
const {authorize, Seller_authorize} = require('./database/Query/LoginAuthorization');
const {addCustomer, query_checker} = require('./database/Query/Customer_query');
 
 
app.get('/login', async (req, res) => {
    res.render('index', { ctoken : 'unauthorized', stoken : 'unauthorized' })
}
);
 
// omi's code

// this route is used to go from any section to other section in profile sidebar pane
app.get('/seller_authorize/:shopname/:shopid', async (req, res)=>
{
    const shopname = req.params.shopname;
    const shopid = req.params.shopid;

    const query = `SELECT * 
    FROM SELLER_USER
    WHERE SHOP_ID = :shopid `;

    const params = {
        shopid: req.params.shopid
    };
 
    const r = await db_query(query,params); 

    res.render('newShopOwnerProfile', { SHOP_ID: r[0].SHOP_ID, PHONE : r[0].PHONE, EMAIL : r[0].EMAIL , SHOP_NAME: r[0].SHOP_NAME , SHOP_LOGO : r[0].SHOP_LOGO , DESCRIPTION: r[0].DESCRIPTION ,TOTAL_REVENUE : r[0].TOTAL_REVENUE});
}
);
 
app.post('/seller_authorize', async (req, res)=>
{
    console.log("Request body:", req.body); 

    if(req.body.username2 && req.body.password2) {

        var r = await Seller_authorize(req.body.username2,req.body.password2);
 
        if (r.length>0) 
        {
            console.log('OK');
 
            res.render('newShopOwnerProfile', { SHOP_ID: r[0].SHOP_ID, PHONE : r[0].PHONE, EMAIL : r[0].EMAIL , SHOP_NAME: r[0].SHOP_NAME , SHOP_LOGO : r[0].SHOP_LOGO , DESCRIPTION: r[0].DESCRIPTION ,TOTAL_REVENUE : r[0].TOTAL_REVENUE});
            return;
        }
 
        else res.render('index', { ctoken : 'unauthorized', stoken : 'blocked' }) ;
        console.log('not ok');
    }

    else {

        console.log("Profile Post from Seller Update");
        var shopId = req.body.shopId;

        console.log(shopId);
 
        const query = `
            UPDATE SELLER_USER 
            SET SHOP_NAME = :shopname, PHONE = :phone, EMAIL = :email, DESCRIPTION = :description
            WHERE SHOP_ID =:shopId
        `;

        const params = {
            shopId: req.body.shopId
        };
     
        const r = await db_query(query,params);
    
        res.redirect('/seller_authorize/'+ req.body.shopname+'/'+ req.body.shopId);
   }
}
);

// Customer User Account
 
app.get('/user/:userid', async (req, res) => {
 
    const query= `SELECT C.*, A.STREET_NAME, A.POSTAL_CODE , A.CITY, A.DIVISION, A.COUNTRY
    FROM CUSTOMER_USER C JOIN ADDRESS A ON (C.USER_ID = A.USER_ID AND C.USER_ID = : userid)
    `; 

    const params = {
        userid: req.params.userid
    } ;
 
    const result= await db_query(query,params); 
 
    res.render('newCustomerProfile', { NAME: result[0].NAME , PHONE : result[0].PHONE  , EMAIL : result[0].EMAIL , userID : result[0].USER_ID ,  DOB : result[0].DATE_OF_BIRTH , GENDER: result[0].GENDER , PROFILEPIC: result[0].PROFILE_PICTURE , STREET: result[0].STREET_NAME , POSTCODE: result[0].POSTAL_CODE , CITY: result[0].CITY , DIVISION: result[0].DIVISION , COUNTRY: result[0].COUNTRY});
    return;
}
);   

app.post('/user/:userid', async (req, res) => {
 
    console.log("Profile Post");
 
    // const query = `
    //     UPDATE CUSTOMER_USER 
    //     SET NAME = :name, PHONE = :phone, EMAIL = :email , PROFILE_PICTURE = :profilePic , GENDER = :gender
    //     WHERE USER_ID =:userid
    // `;

//     const query = `UPDATE CUSTOMER_USER 
//     SET NAME = ${req.body.name}, PHONE = ${req.body.phone}, EMAIL =  ${req.body.email}, PROFILE_PICTURE =  ${req.body.profilePic}, GENDER =  ${req.body.gender}
//     WHERE USER_ID = ${req.params.userid}
// `;

    const query = `UPDATE CUSTOMER_USER 
    SET NAME = \'${req.body.name}\', PHONE = \'${req.body.phone}\', EMAIL =  \'${req.body.email}\', PROFILE_PICTURE =  \'${req.body.profilePic}\', GENDER =  \'${req.body.gender}\'
    WHERE USER_ID = ${req.params.userid}
`;

    const params = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        gender: req.body.gender,
        profilePic: req.body.profilePic,
        userid : req.params.userid
    };

    console.log(query);

 
    try {  
        const result = await db_query(query, []);

    } catch (error) {
        console.error('Error updating data:', error);
    }

    res.redirect('/user/'+req.params.userid);
});
 
// app.post('/user/:userid', async (req, res) => {
 
//     console.log("Profile Post");
 
//     const query = `
//         UPDATE CUSTOMER_USER 
//         SET NAME = :name, PHONE = :phone, EMAIL = :email , PROFILE_PICTURE = :profilePic , GENDER = :gender
//         WHERE USER_ID =:userid
//     `;

//     const params = {
//         name: req.body.name,
//         phone: req.body.phone,
//         email: req.body.email,
//         gender: req.body.gender,
//         profilePic: req.body.profilePic,
//         userid : req.params.userid
//     };

 
//     try {
//         console.log("done1");
//         const result = await db_query(query, params);
//         console.log("donedone");
//     } catch (error) {
//         console.error('Error updating data:', error);
//     }

//     const query1 = `
//         UPDATE ADDRESS 
//         SET STREET_NAME = :street, POSTAL_CODE = :postCode , CITY = :city , DIVISION = :division , COUNTRY = :country
//         WHERE USER_ID =:userid
//     `;

//     const params1 = {
//         street: req.body.street,
//         postCode: req.body.postCode,
//         city: req.body.city,
//         division: req.body.division,
//         country: req.body.country,
//         userid : req.params.userid
//     };


//     try {
//         console.log("done2");
//         const result1 = await db_query(query1, params1);
//     } catch (error) {
//         console.error('Error updating data:', error);
//     }

//     res.redirect('/user/'+req.params.userid);
// });
 
//after submitting login page
 
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
 
    res.render('newSellerAddProduct', { SHOP_NAME: shopname, SHOP_ID: shopid });
});



app.post('/addproducts/:shopname/:shopid', async (req, res) => {
    
    // Promo Code availiability should handle

    const { productname, productDescrip, Category , productPrice, discount , productImage, productQuantity, promoCode } = req.body;
    console.log(req.body);
    const shopname = req.params.shopname;
    const shopid = req.params.shopid;
     
    const maxProductIdQuery = `SELECT MAX(PRODUCT_ID) AS MAX_PRODUCT_ID FROM PRODUCTS`;
    const params = [];
    
    const maxProductIdResult = await db_query(maxProductIdQuery, params);
    const maxProductId = maxProductIdResult[0].MAX_PRODUCT_ID + 1;
    console.log(maxProductId);

    // const addDiscountQuery = `INSERT INTO DISCOUNTS (PROMO_CODE, DISCOUNT_AMOUNT, IS_EXPIRED) VALUES (:promoCode, :discount , 1)`;
    // const params4 = {
    //     promoCode: promoCode,
    //     discount: discount
    // };

    // const DiscountQueryresult = await db_query(addDiscountQuery, params4);
 
    const CategoryIdQuery = `SELECT CATAGORY_ID FROM CATAGORY WHERE CATAGORY_NAME = :Category`;
    const params2 = {
        Category: Category
    }
    const CategoryIdResult = await db_query(CategoryIdQuery, params2);

    const CategoryId = CategoryIdResult[0].CATAGORY_ID;
    console.log(CategoryId);

    const addProductquery = `INSERT INTO PRODUCTS (PRODUCT_ID, PRODUCT_NAME , CATAGORY_ID ,DESCRIPTION, PRODUCT_IMAGE ,STOCK_QUANTITY,PRICE, PROMO_CODE , SHOP_ID)
    VALUES (:maxProductId, :productname, :CategoryId, :productDescrip, :productImage, :productQuantity, :productPrice, :promoCode , :shopid)`;

    const params3 = {
        maxProductId: maxProductId,
        productname: productname,
        CategoryId: CategoryId,
        productDescrip: productDescrip,
        productImage: productImage,
        productQuantity: productQuantity,
        productPrice: productPrice,
        promoCode: promoCode,
        shopid: shopid
    };

    const result = await db_query(addProductquery, params3);

    res.redirect('/addproducts/' + req.params.shopname + '/' + req.params.shopid);

    }
);

app.get('/products/:shopname/:shopid', async (req, res) => {
    const shopname = req.params.shopname;
    const shopid = req.params.shopid;

    const query = `
        SELECT * FROM PRODUCTS 
        WHERE SHOP_ID =:shopid
    `;

    const params = {
        shopid: req.params.shopid
    };
 
    const products = await db_query(query,params) ;


    res.render('SellerProducts', { SHOP_NAME: shopname, SHOP_ID: shopid, products: products });
});

app.get('/product-details/:productid', async (req, res) => {


    const productid = req.params.productid;

    const query = `SELECT P.PRODUCT_ID , P.PRODUCT_NAME, (SELECT CATAGORY_NAME FROM CATAGORY C WHERE C.CATAGORY_ID = P.CATAGORY_ID) CATEGORY_NAME, P.DESCRIPTION, P.PRODUCT_IMAGE, P.STOCK_QUANTITY, P.PRICE, P.PROMO_CODE , S.SHOP_ID , S.SHOP_NAME
    FROM PRODUCTS P JOIN SELLER_USER S ON P.SHOP_ID = S.SHOP_ID
    WHERE PRODUCT_ID = :productid
    `;

    const params = {
        productid: req.params.productid
    };
 
    const productDetails = await db_query(query,params) ;

    console.log(productDetails);

    res.render('productDetails', {
        PRODUCT_ID: productDetails.PRODUCT_ID,
        DESCRIPTION: productDetails.DESCRIPTION,
        PRODUCT_NAME: productDetails.PRODUCT_NAME,
        CATEGORY_NAME: productDetails.CATEGORY_NAME,
        STOCK_QUANTITY: productDetails.STOCK_QUANTITY,
        PRICE: productDetails.PRICE,
        PROMO_CODE: productDetails.PROMO_CODE,
        SHOP_ID: productDetails.SHOP_ID,
        SHOP_NAME: productDetails.SHOP_NAME
    });

});


app.post('/product-details/:productid', async (req, res) => {


    const productid = req.params.productid;

    const query = `
        UPDATE PRODUCTS
        SET PRODUCT_NAME = '${productid}', DESCRIPTION = '${req.body.description}', STOCK_QUANTITY = '${req.body.qunatity}', PRICE = '${req.body.price}', PROMO_CODE = '${req.body.promocode}'
        WHERE PRODUCT_ID =:productid
    `;

    const params = {
        productid: req.params.productid
    };
 
    const productDetails = await db_query(query,params) ;

    res.redirect('/product-details/' + req.params.productid);

});

app.get('/password/:shopname/:shopid', async (req, res) => {

    const shopname = req.params.shopname;
    const shopid = req.params.shopid;

    const query = `
        DECLARE
            v_shopid NUMBER;
            v_password VARCHAR2(20);
        BEGIN
            v_shopid := :shopid;
            SELECT PASSWORD INTO :password
            FROM SELLER_USER
            WHERE SHOP_ID = v_shopid;
        END;
    `;

    const params = {
        shopid: { dir: oracledb.BIND_IN, val: shopid },
        password: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 }
    };


    const result = await db_query(query, params);
    console.log(params.password);
        
    res.render('ChangePasswordSellerProfile', { SHOP_NAME: shopname, SHOP_ID: shopid , PASSWORD: params.password });
});

app.post('/password/:shopname/:shopid', async (req,res) => {
    
    const shopname = req.params.shopname;
    const shopid = req.params.shopid;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    const query1 = `
        SELECT PASSWORD FROM SELLER_USER
        WHERE SHOP_ID = :shopid
    `;

    const params1 = {
        shopid: shopid
    };

    const result1 = await db_query(query1, params1);
    console.log(result1);

    if(newPassword != confirmPassword || oldPassword != result1[0].PASSWORD) {
    
        console.log("Password Change Failed!");
        res.render('ChangePasswordSellerProfile', { SHOP_NAME: shopname, SHOP_ID: shopid , PASSWORD: oldPassword , message: "Password changed Failed!.Review your input!"});
    } 
        
    else {
        const query = `
        DECLARE
            v_password VARCHAR2(20);
            v_shopid NUMBER;
        BEGIN
            v_shopid := :shopid;
            v_password := :newPassword;
                    
            UPDATE SELLER_USER 
            SET PASSWORD = v_password
            WHERE SHOP_ID = v_shopid;
        END;
        `;
    
        const params = {
            shopid: shopid,
            newPassword: newPassword
        };
    
        const result = await db_query(query, params);
    
        console.log("Password Changed Successfully!");
    
        res.render('ChangePasswordSellerProfile', { SHOP_NAME: shopname, SHOP_ID: shopid ,  PASSWORD: params.newPassword , message: "Password Changed Successfully!"});
    
    }
    
});


app.get('/Password/:userId', async (req, res) => {

    const userId = req.params.userId;

    // const query = `
    // `;

    // const params = {
    //     shopid: { dir: oracledb.BIND_IN, val: shopid },
    //     password: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 }
    // };


    const result = await db_query(query, params);
        
    res.render('ChangePasswordCustomerProfile', { userID: userId });
});

app.post('/Password/:userId', async (req,res) => {
    
    const userId = req.params.userId;

    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;


    const result1 = await db_query(query1, params1);
    console.log(result1);

    if(newPassword != confirmPassword || oldPassword != result1[0].PASSWORD) {
    
        console.log("Password Change Failed!");
        res.render('ChangePasswordCustomerProfile', {  userID: userId  , PASSWORD: oldPassword , message: "Password changed Failed!.Review your input!"});
    } 
        
    else {
        const query = `
        DECLARE
            v_password VARCHAR2(20);
            v_shopid NUMBER;
        BEGIN
            v_shopid := :shopid;
            v_password := :newPassword;
                    
            UPDATE SELLER_USER 
            SET PASSWORD = v_password
            WHERE SHOP_ID = v_shopid;
        END;
        `;
    
        const params = {
            shopid: shopid,
            newPassword: newPassword
        };
    
        const result = await db_query(query, params);
    
        console.log("Password Changed Successfully!");
    
        res.render('ChangePasswordCustomerProfile', {  userID: userId  ,  PASSWORD: params.newPassword , message: "Password Changed Successfully!"});
    
    }
    
});


// order history routing
app.get('/order/:userid', async (req, res) => {
 
    const query= `SELECT O.ORDER_ID, P.PRODUCT_NAME , SUM (O.TOTAL_PRICE) AS TOTAL_PRICE , O.PAYMENT_TYPE
    FROM ORDERS O JOIN PRODUCTS P ON O.PRODUCT_ID = P.PRODUCT_ID
    WHERE O.ORDER_ID IN (
        SELECT C.CART_ID
        FROM CART C
        WHERE C.USER_ID IN (
            SELECT CUS.USER_ID
            FROM CUSTOMER_USER CUS
            WHERE CUS.USER_ID = :userid
        )
    ) AND DELIVERY_STATUS = 'DELIVERED'
		GROUP BY O.ORDER_ID , O.PAYMENT_TYPE ,P.PRODUCT_NAME
`; 

    const params = {
        userid: req.params.userid
    };
 
    const orderHistory = await db_query(query,params); 
 
    res.render('customerOrderHistory', { USER_ID: req.params.userid , orderHistory: orderHistory });
    return;
}
); 

// wishlist routing
app.get('/wishlist/:userid', async (req, res) => {
     
        const query= `SELECT P.PRODUCT_NAME , (SELECT CATAGORY_NAME FROM CATAGORY C WHERE P.CATAGORY_ID = C.CATAGORY_ID ) AS CATAGORY ,P.PRICE
        FROM WISHLIST W JOIN PRODUCTS P ON W.PRODUCT_ID = P.PRODUCT_ID AND W.USER_ID = :userid`; 
    
        const params = {
            userid: req.params.userid
        };
     
        const wishlist = await db_query(query,params); 
     
        res.render('wishlist', { USER_ID: req.params.userid , wishlist: wishlist });
        return;
});


// pending orders route

app.get('/pendingOrders/:shopname/:shopid', async (req, res) => {
     
    const query= `SELECT O.ORDER_ID,P.PRODUCT_ID, O.USER_ID, P.SHOP_ID ,(SELECT SHOP_NAME FROM SELLER_USER S WHERE S.SHOP_ID = P.SHOP_ID ) SHOP_NAME, P.PRODUCT_NAME , O.TOTAL_PRICE , (SELECT C.QUANTITY FROM CART C WHERE C.PRODUCT_ID = O.PRODUCT_ID) QUANTITY ,O.PAYMENT_TYPE , O.DELIVERY_STATUS
    FROM PRODUCTS P JOIN ORDERS O ON P.PRODUCT_ID = O.PRODUCT_ID
    WHERE P.SHOP_ID = :shopid AND O.DELIVERY_STATUS <> 'DELIVERED' AND O.DELIVERY_STATUS <> 'CANCELLED'`; 

    const params = {
        shopid: req.params.shopid
    };
 
    const pendingOrders = await db_query(query,params); 

    console.log(req.params.shopname);

    res.render('pendingOrders', { 
        pendingOrders: pendingOrders, 
        SHOP_ID: req.params.shopid, 
        SHOP_NAME: req.params.shopname
    });

    return;
});

app.post('/updateDeliveryStatus', async (req, res) => {
    const { status, ORDER_ID, PRODUCT_ID, USER_ID } = req.body;
    console.log(req.body);

    const Status = req.body.status;
    const orderId = req.body.ORDER_ID;
    const productId = req.body.PRODUCT_ID;
    const userId = req.body.USER_ID;
    const shopId = req.body.SHOP_ID;
    const shopName = req.body.SHOP_NAME;

    const query = `UPDATE ORDERS
    SET DELIVERY_STATUS = : Status
    WHERE ORDER_ID = :orderId AND PRODUCT_ID= :productId AND USER_ID= :userId` ;

    const params = {
        Status: Status,
        orderId: orderId,
        productId: productId,
        userId: userId
    };

    const result = await db_query(query, params);

    res.redirect(`/pendingOrders/${shopName}/${shopId}`);

});

app.get('/OrderTrack/:userId', async (req, res) => {
        
        const userId = req.params.userId;

        const query = `SELECT O.ORDER_ID , P.PRODUCT_NAME , (SELECT C.QUANTITY CART FROM CART C WHERE P.PRODUCT_ID=C.PRODUCT_ID AND C.USER_ID= :USER_ID ) QUANTITY ,O.TOTAL_PRICE , O.DELIVERY_STATUS , O.PAYMENT_TYPE
        FROM ORDERS O JOIN PRODUCTS P ON O.PRODUCT_ID = P.PRODUCT_ID
        WHERE O.USER_ID= :USER_ID AND O.ORDER_ID = (SELECT MAX(ORDER_ID) FROM ORDERS WHERE USER_ID = :USER_ID)`;

        const params = { USER_ID: userId };

        const lastOrderTrack = await db_query(query, params);

        console.log(lastOrderTrack); 

        res.render('OrderTrack', { OrderTrack: lastOrderTrack, USER_ID: userId });
});

// app.post('/OrderTrack', async (req, res) => {
//     const { userId } = req.body;
//     console.log(req.body);

//     const USER_ID = req.body.userId ;

//     const query = `SELECT O.ORDER_ID , P.PRODUCT_NAME , (SELECT C.QUANTITY CART FROM CART C WHERE P.PRODUCT_ID=C.PRODUCT_ID ) QUANTITY ,O.TOTAL_PRICE , O.DELIVERY_STATUS , O.PAYMENT_TYPE
//     FROM ORDERS O JOIN PRODUCTS P ON O.PRODUCT_ID = P.PRODUCT_ID
//     WHERE O.USER_ID= :USER_ID AND O.ORDER_ID = (SELECT MAX(UNIQUE ORDER_ID) FROM ORDERS WHERE USER_ID = :USER_ID)` ;

//     const params = {
//         USER_ID: USER_ID
//     };

//     const lastOrderTrack = await db_query(query, params);

//     console.log("Hi");

//     res.render('OrderTrack', {OrderTrack : lastOrderTrack , USER_ID: USER_ID});

// });

 
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