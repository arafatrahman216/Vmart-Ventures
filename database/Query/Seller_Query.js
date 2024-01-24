const OracleDB = require('oracledb');
const db_query= require('../connection');
const { authorize } = require('./LoginAuthorization');


const addSeller =async (email, phone, shopname , street, postal_code,city, division , password , description )=>
{
    const e = await authorize(email,password) ;
    
    if (e.length>0)
    {
        console.log('user already exists');
        return e[0].USER_ID ;  
    }

    var shopid= await query_checker();
    shopid++;

    console.log('shopid');
 
    const query= `INSERT INTO SELLER_USER (USER_ID, EMAIL, PHONE, NAME, PASSWORD, PROFILE_PICTURE, GENDER, DATE_JOINED, DATE_OF_BIRTH) VALUES (${userId}, \'${email}\', \'${phone}\', \'${name}\', ORA_HASH(\'${password}\'), 'profile.jpg', \'${gender}\', SYSDATE, TO_DATE(\'${dob}\', 'YYYY-MM-DD')) `;
    const query2= `INSERT INTO ADDRESS (USER_ID, STREET_NAME, POSTAL_CODE, CITY, DIVISION, COUNTRY) VALUES (${userId}, \'${street}\', \'${postal_code}\', \'${city}\', \'${division}\','Bangladesh')`;
    
    OracleDB.autoCommit=true;
    const params=[];
    db_query(query,params);
    db_query(query2,params);
    return userId;
    
}

const query_checker= async ()=>
{
    const query= `SELECT MAX(USER_ID) as MID FROM SELLER_USER`;
    const params=[];
    
    const r= await db_query(query,params) ;
    // console.log('r');
    // console.log(r);
    // console.log('length '); 
    // console.log(r.length);
    // console.log(r[0].MID); 
    return r[0].MID;
}


module.exports= {addSeller, query_checker};