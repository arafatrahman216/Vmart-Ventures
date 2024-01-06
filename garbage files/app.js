const arafat = 'arafat'

const sayhi=(name) =>
{
    console.log(`say hi to ${name}`)
}
const moduler= require('./main')

// sayhi(moduler)
console.log(moduler);
sayhi(moduler.findthis)

sayhi(moduler.modulecheck)
sayhi('arafatboss')
sayhi(arafat)
const os= require('os')
const myos= 
{
    name: os.type(),
    release: os.release(),
    totalMemory: os.totalmem()/(1024*1024*1024),
    FreeMemory: os.freemem()/(1024*1024*1024)
}    
console.log(myos);
