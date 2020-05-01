const express = require('express');
const app = express();
const bodyParser=require('body-parser');
const cors = require('cors');
const fs = require('fs')
const mssql=require('mssql');
var corsOptions={
    origin:'http://localhost:4200',
    optionsSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use((req,res,next)=>{
    console.log("getting: " + req.path);
    next();
})


app.get('/docs/:docname',(req,res)=>{
    var name=req.params.docname.replace(/[/]/g,"");
    var tempFile="./docs/"+name;
        fs.readFile(tempFile, (err,data)=>{
            res.contentType('arraybuffer');
            res.send(data);
        });
});
app.get('/data/:name', (req,res)=>{
    (async function getTestData() {
        try {
            let pool = await mssql.connect(config)
            let result1 = await pool.request()
                .query('select top 1000 * from v_basic_vulk_data;')
            mssql.close();
            res.send(result1);
        } catch (err) {
            console.log(err);
        }
    })()
    
});
const config = {
    user: 'username',
    password: 'password',
    server: 'serverhostname', // You can use 'localhost\\instance' to connect to named instance
    database: 'databasename',
 
    options: {
        encrypt: false // Use this if you're on Windows Azure
    }
}

 
mssql.on('error', err => {
    console.log(err);
})
app.listen(3000,()=>{console.log('Server started!');});