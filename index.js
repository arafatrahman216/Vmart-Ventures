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
 
 
const path = require('path');
const { lowerCase } = require('lodash');
const { log } = require('console');
 
const {authorize, Seller_authorize} = require('./database/Query/LoginAuthorization');
const {addCustomer, query_checker} = require('./database/Query/Customer_query');
 
 
app.get('/login', async (req, res) => {
    res.render('index', { ctoken : 'unauthorized', stoken : 'unauthorized' })
}
);
 
// arafat's code
// app.post('/seller_authorize', async (req, res)=>
// {
//     console.log('post request');
//         console.log(req.body.username2);
//         console.log(req.body.password2);
//         var email=req.body.username2;
//         var password=req.body.password2;
//         var r= await Seller_authorize(email,password);
//         console.log(r.length);
//         if (r.length>0) 
//         {
//             console.log('OK');
//             var linkurl='/user/'+r[0].USER_ID;
//             res.render('home', { Name: r[0].NAME, Phone : r[0].PHONE_NUMBER , userID: r[0].USER_ID, link: linkurl});
//             return;
//         }
//         else res.render('index', { ctoken : 'unauthorized', stoken : 'blocked' }) ;
//         console.log('not ok');
//     }
 
// );
 
// omi's code

app.get('/seller_authorize', async (req, res)=>
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
        let shopId = req.body.shopId;
 
        const query = `
            UPDATE SELLER_USER 
            SET SHOP_NAME = :shopname, PHONE = :phone, EMAIL = :email, DESCRIPTION = :description
            WHERE SHOP_ID LIKE =:shopId
        `;
    
        //res.redirect('/seller_authorize');
        res.send("Profile Updated Successfully!");
    
   }

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
        let shopId = req.body.shopId;
 
        const query = `
            UPDATE SELLER_USER 
            SET SHOP_NAME = :shopname, PHONE = :phone, EMAIL = :email, DESCRIPTION = :description
            WHERE SHOP_ID LIKE =:shopId
        `;
    
        //res.redirect('/seller_authorize');
        res.send("Profile Updated Successfully!");
    
   }

}
 
);

// when seller updating his information
// app.post('/seller_authorize', async (req, res) => {
 
//     console.log("Profile Post from Seller Update");
//     let shopId = req.params.shopId;
 
//     const query = `
//         UPDATE SELLER_USER 
//         SET SHOP_NAME = :shopname, PHONE = :phone, EMAIL = :email, DESCRIPTION = :description
//         WHERE SHOP_ID LIKE =:shopId
//     `;
 
//     // const params = {
//     //     name: req.body.name,
//     //     phone: req.body.phone,
//     //     email: req.body.email,
//     //     userId: req.params.userid
//     // };
 
//     // try {
//     //     const result = await db_query(query, params);
//     // } catch (error) {
//     //     console.error('Error updating data:', error);
//     // }

//     res.redirect('/seller_authorize');
// });
 
 
// arafat code
// app.get('/user/:userid', async (req, res) => {
 
//     console.log('get request');
//     const id= (req.params.userid);
//     console.log(id);
 
//     const query= `SELECT * FROM CUSTOMER_USER WHERE USER_ID LIKE ${id}`; 
//     const params=[];
//     const result= await db_query(query,params); 
 
//     console.log(result.length);
 
//     if (result.length<1)
//     {
//         res.send(`<h1> User with id ${id} not found </h1>`);
//         return;
//     }
 
//     const user_name=result[0].NAME;
//     console.log(user_name);
 
//     const phone = result[0].PHONE_NUMBER;
//     console.log(phone);
 
//     const Gender = result[0].GENDER ;
 
//     res.render('profile', { Name: user_name, Phone : phone , id: id, gender : Gender, email : result[0].EMAIL, dob : result[0].DATE_OF_BIRTH});
//     return;
// }
// );
 
 
app.get('/user/:userid', async (req, res) => {
 
    const query= `SELECT * FROM CUSTOMER_USER WHERE USER_ID LIKE ${req.params.userid}`; 
    const params=[];
 
    const result= await db_query(query,params); 
 
    res.render('profile', { name: result[0].NAME , phone : result[0].PHONE  , email : result[0].EMAIL , userID : result[0].USER_ID});
    return;
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
    res.redirect('/user/'+req.params.userid);
});
 
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

      const { productname, productDescrip, productPrice, productQuantity, promoCode } = req.body;
      const shopname = req.params.shopname;
      const shopid = req.params.shopid;

      console.log(req.body);

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


    res.render('SellerProducts', { shopname: shopname, shopid: shopid, products: products });
});

//     try {
 
 
//       const { productname, productDescrip, productPrice, productQuantity, promoCode } = req.body;
//       const shopname = req.params.shopname;
//       const shopid = req.params.shopid;
 
//       // Assuming you have a table named 'products' with appropriatecolumns
//       const query = `
//         INSERT INTO PRODUCTS (shopname, shopid, productname, productdescrip, productprice, productquantity, promocode)
//         VALUES (:shopname, :shopid, :productname, :productdescrip, :productprice, :productquantity, :promocode)
//       `;
 
//       const params = {
//         shopname,
//         shopid,
//         productname,
//         productdescrip: productDescrip,
//         productprice: productPrice,
//         productquantity: productQuantity,
//         promocode: promoCode
//       };
 
//       const result = await db_query(sql, params);
 
//       console.log("Product added successfully to the database");
//       res.status(200).send("Product added successfully to the database");
//     } catch (error) {
//       console.error("Error adding product to the database:", error);
//       res.status(500).send("Internal Server Error");
//     }
//   });
 
 
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