const http= require('http')
const server= http.createServer((req,res)=>
{
    // console.log(req);
    // res.write('hello world bro')
    if (req.url==='/about')
    {
        res.end(`<h1>about page</h1>
        <p>hello world</p>
        <h2><b><a href="/contact">contact</a></b></h2>
        <h2><b><a href="/else">Error page</a></b></h2>`)
        

    }
    else if (req.url==='/contact')
    {
        res.end(`<h1>contact page</h1>
        <p>hello world</p>
        <h2><b><a href="/about">about</a></b></h2>
        <h2><b><a href="/else">Error page</a></b></h2>`)
        
    }
    else
    {
        res.end(
            `<h1>Error 404 at ${res.url}!!</h1>
            <p>page not found</p>
            <h2><b><a href="/about">Try Again</a></b></h2>`       
        )
    }
    // res.end('hello world bro again')
})
server.listen(5000)
// console.log(server);
