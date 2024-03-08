const OracleDB = require('oracledb');
const db_query= require('../connection');
const { authorize } = require('./LoginAuthorization');
const { result } = require('lodash');


const addCustomer=async (name,email,phone,password,gender,dob, street, postal_code,city, division )=>
{
    const e= await authorize(email,password);
    if (e.length>0)
    {
        console.log('user already exists');
        return e[0].USER_ID ;  
    }
    var userId= await query_checker();
    userId++;
    const query= `INSERT INTO CUSTOMER_USER (USER_ID, EMAIL, PHONE, NAME, PASSWORD, PROFILE_PICTURE, GENDER, DATE_JOINED, DATE_OF_BIRTH) VALUES (${userId}, \'${email}\', \'${phone}\', \'${name}\', ORA_HASH(\'${password}\'), 'profile.jpg', \'${gender}\', SYSDATE, TO_DATE(\'${dob}\', 'YYYY-MM-DD')) `;
    const query2= `INSERT INTO ADDRESS (USER_ID, STREET_NAME, POSTAL_CODE, CITY, DIVISION, COUNTRY) VALUES (${userId}, \'${street}\', \'${postal_code}\', \'${city}\', \'${division}\','Bangladesh')`;
    OracleDB.autoCommit=true;
    const params=[];
    db_query(query,params);
    db_query(query2,params);
    return userId;
    
}



const get_user= async (id)=>
{
    const query= `SELECT * FROM CUSTOMER_USER WHERE USER_ID=${id}`;
    const params=[];
    const result= await db_query(query,params);
    return result;
}

const query_checker= async ()=>
{
    const query= `SELECT MAX(USER_ID) as MID FROM CUSTOMER_USER`;
    const params=[];
    
    const r= await db_query(query,params) ;
    return r[0].MID;
}

const set_products= async (result) =>
{
    const products = [];

    for (let i = 0; i < result.length; i++) {
        const product = {
            PRODUCT_ID: result[i].PRODUCT_ID,
            PRODUCT_NAME : result[i].PRODUCT_NAME,
            PRODUCT_PRICE: result[i].PRICE,
            PRODUCT_STOCK: result[i].STOCK_QUANTITY,
            PRODUCT_DESCRIPTION: result[i].DESCRIPTION,
            PRODUCT_IMAGE: result[i].PRODUCT_IMAGE,
            PRODUCT_RATING : result[i].RATING,
            PRODUCT_CATAGORY : result[i].CATAGORY_NAME,
            SHOP_NAME: result[i].SHOP_NAME,
            PRODUCT_SHOP_ID : result[i].SHOP_ID,
            // DISCOUNT : result[i].DISCOUNT_AMOUNT
        };
        products.push(product);
    }
    return products;
}

const get_products= async (id)=>
{
    // console.log(id);
    var query= `SELECT * FROM PRODUCTS P LEFT JOIN CATAGORY C ON P.CATAGORY_ID=C.CATAGORY_ID JOIN SELLER_USER S ON S.SHOP_ID= P.SHOP_ID `
    +`WHERE P.PRODUCT_ID LIKE ${id} ORDER BY PRODUCT_ID`;   
    if (id=='all') query= `SELECT * FROM PRODUCTS P LEFT JOIN CATAGORY C ON P.CATAGORY_ID=C.CATAGORY_ID JOIN SELLER_USER S ON S.SHOP_ID= P.SHOP_ID `;
    const params=[];

    try{
        const result= await db_query(query,params);
        return result;
    } 
    catch (error) {
        console.log("Error getting data:", error);
        return params;
    }
}

const Search_products_by_name= async (name)=>
{
    const query= `SELECT * FROM PRODUCTS P LEFT JOIN CATAGORY C ON P.CATAGORY_ID=C.CATAGORY_ID JOIN SELLER_USER S ON S.SHOP_ID= P.SHOP_ID WHERE LOWER(P.PRODUCT_NAME) LIKE LOWER(\'%${name}%\')`;
    const params=[];
    console.log(query);
    const result= await db_query(query,params); 
    console.log(result);    
    return result;
}

const Filter_Products= async (priceUnder, categoryId)=>
{
    let query= ``;
    if (categoryId) {
        // Apply category filter logic here based on the provided categoryId
        query= `SELECT P.PRODUCT_ID, P.PRODUCT_NAME, P.PRICE, P.PRODUCT_IMAGE AS IMAGE, C.CATAGORY_NAME, S.SHOP_NAME, S.SHOP_ID, P.STOCK_QUANTITY 
        FROM PRODUCTS P LEFT JOIN CATAGORY C ON P.CATAGORY_ID=C.CATAGORY_ID JOIN SELLER_USER S ON S.SHOP_ID= P.SHOP_ID
        WHERE P.CATAGORY_ID = ${categoryId}`
    }
    
    if (priceUnder !=0 ) {
        // query= `SELECT * FROM CUSTOMER_USER `;
        let union_query= `SELECT P.PRODUCT_ID, P.PRODUCT_NAME, P.PRICE, P.PRODUCT_IMAGE AS IMAGE, C.CATAGORY_NAME, S.SHOP_NAME, S.SHOP_ID , P.STOCK_QUANTITY `+
        ` FROM PRODUCTS P LEFT JOIN CATAGORY C ON P.CATAGORY_ID=C.CATAGORY_ID JOIN SELLER_USER S ON S.SHOP_ID= P.SHOP_ID`
        +` WHERE P.PRICE < ${priceUnder}`    
        // query+= ` INTERSECTION ${union_query}`;
        if (categoryId) query+= ` INTERSECT ${union_query}`;
        else query+= union_query;
    }
    const params=[];
    console.log(query);
    let filtered_products = await db_query(query,params);
    // console.log("Filtered products: ");
    // console.log(filtered_products);
    return filtered_products;

}


const update_user= async (userid, name, email, phone) =>
{
    const params = {
        name: name,
        phone: phone,
        email: email,
        userId: userid
    };
    const query = `
        UPDATE CUSTOMER_USER 
        SET NAME = :name, PHONE = :phone, EMAIL = :email 
        WHERE USER_ID LIKE :userid
    `;
 
    try {
        const result = await db_query(query, params);
    } catch (error) {
        console.error('Error updating data:', error);
    }
}

const set_seller= async ( seller_info )=>
{
    const seller = {
        SHOP_ID: seller_info.SHOP_ID ,
        SHOP_NAME: seller_info.SHOP_NAME,
        EMAIL: seller_info.EMAIL,
        PHONE: seller_info.PHONE,
        DESCRIPTION : seller_info.DESCRIPTION,
        TOTAL_REVENUE : seller_info.TOTAL_REVENUE
    };
    return seller;   
}

const get_seller= async (id)=>
    {
        const query= `SELECT * FROM SELLER_USER WHERE SHOP_ID=${id}`;
        const params=[];
        const result = await db_query(query,params);
        return result;
    }



module.exports= {  addCustomer,
    query_checker,
    set_products,
    Filter_Products,
    get_products,
    Search_products_by_name,
    get_user,
    update_user,
    set_seller,
    get_seller
};