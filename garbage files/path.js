const authentication=(username, password)=>{
    if(username==='admin' && password==='admin'){
        return true;
    }else{
        return false;
    }
}
module.exports=authentication;