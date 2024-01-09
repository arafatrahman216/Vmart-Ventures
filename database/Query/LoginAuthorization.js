
const db_query= require('../connection');
const authorize= async (email, password)=>{
    
    const query= `SELECT * FROM HR.CUSTOMER_USER WHERE EMAIL LIKE \'${email}\' AND PASSWORD LIKE \'${password}\'`;
    const params=[];
    const r= await db_query(query,params);
    console.log(r);
    console.log(r.length);
    return r;
}

module.exports= authorize;