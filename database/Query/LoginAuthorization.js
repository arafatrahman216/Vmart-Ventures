
const db_query= require('../connection');

const authorize= async (email, password)=>{
    
    const query= `SELECT * FROM CUSTOMER_USER WHERE EMAIL LIKE \'${email}\' AND PASSWORD LIKE ORA_HASH(\'${password}\')`;
    // const query= `SELECT * FROM HR.CUSTOMER_USER WHERE EMAIL LIKE :email AND PASSWORD= ORA_HASH(:password)`;
    const params=[];
    const r= await db_query(query,params);
    console.log(r);
    console.log(r.length);
    return r;
}


const Seller_authorize= async (email, password)=>{
    
    console.log('in seller authorize');
    console.log(email);
    console.log(password);
    const query= `SELECT * FROM SELLER_USER WHERE EMAIL LIKE \'${email}\' AND PASSWORD = ORA_HASH(\'${password}\')`;    const params=[];
    const r= await db_query(query,params);
    console.log(r);
    console.log(r.length);
    return r;
}

module.exports= {authorize, Seller_authorize};