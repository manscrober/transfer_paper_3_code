/*
for data pass all params(even singular strings) as array:
/data?itemID[]=746142S3&vexID[]=123&vexID[]=123
*/


const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const express = require('express');
const whitelist = ['http://localhost:4200'];

const app = express();
var corsOptions = {
   /* origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    optionsSuccessStatus: 200
*/
}
const config = {
    server: 'serverhostname', // You can use 'localhost\\instance' to connect to named instance
    options: {
        encrypt: true,
    },
    authentication:{
        type:"default",
        options:{
            userName: 'username',
            password: 'password',
        }
    }
}
const filterablequery = "select orderNum,ItemId,counter, vulkdate,"+
    "vexID,bdeID,convert(varchar,WorkpieceDurability,104) WorkpieceDurability,blankRubberManufactured from v_basic_vulk_data " +
    "where ";



const columnNames={
    itemID: "itemID",
    counter: "counter",
    vexID: "vexID",
    orderNum: "orderNum",
    itemIDSAP: "",
    partNumSAP: "",
    vulkID: "bdeID",
    cageID: "",
    vulkDate: "convert(date,vulkDate)",
    blankRubberBestBefore: "WorkpieceDurability",
    blankRubberManufactured: "substring(ManufacturedAt,1,10)",
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use((req, res, next) => {
    console.log("getting: " + req.url);
    next();
})


app.get('/docs/:docname', (req, res) => {
    var name = req.params.docname.replace(/[/]/g, "");
    var tempFile = "./docs/" + name;
    fs.readFile(tempFile, (err, data) => {
        res.contentType('arraybuffer');
        res.send(data);
    });
});
app.get('/data', (req, res) => {
   getData(req, res);
});

function getData(req, res) {

    let params = req.query;
    let record = [];
    if (Object.keys(params).length = 0) {
        res.send({});
        return;
    }
    //e.g.: [itemID[0,1],vexID[0]]=> "(itemID=itemID0 or itemID=itemID1) and vexID=vexID0"
    let filterstring = Object.keys(params).map(k => //map all keys k of params to 
        {   
            let s="("+                                    //(filters[k]+i or filters[k]+(i+1)) and (filters[k+1]+i or ...)...                                       
            Object.keys(params[k]).map(p=>{
                        if(params[k][p]!=""){             
                            return (columnNames[k]+" = @"+k+p);
                        }else{
                            return (columnNames[k]+" is null");
                        }
                    }  
                ).join(" or ")                             
            +")";
            return s;
        }                                       
    ).join(" and ");                            
    if (filterstring == "") filterstring = " 1=0";//if filterstring is empty filter for false to get an empty result
    let sqlquery = filterablequery + filterstring;
    console.log(sqlquery);
    var request = new Request(sqlquery, function (err, rowCount) {
        if (err) {
            console.log(err);
        } else {
            console.log(rowCount + ' rows. '+"exec time:" + (new Date() - start) + "ms");
        }
        connection.close();
    });

    //add parameters with indices
    //?itemID[]=foo&itemID[]=bar&vexID[]=flip
    //is added as itemID0=foo,itemID1=bar and vexID0=flip
    Object.keys(params).forEach(k => Object.keys(params[k]).forEach(p=>{
        if(params[k][p]!=""){
            request.addParameter(k+p, TYPES.VarChar, params[k][p])
        }
        })
    
    );
    console.log(JSON.stringify(request.parameters));

    request.on('row', function (columns) {
        let recLength = Object.keys(record).length;
        record[recLength] = {};
        columns.forEach((column) => {
            record[recLength][column.metadata.colName] = column.value;
        });
    });

    request.on('requestCompleted', (rowCount, more, rows) => {
        record = JSON.stringify(record);
        res.send(record);
    });
    let start= new Date();
    var connection = new Connection(config);
    connection.on('connect', function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Connected');
        }
        
        connection.execSql(request);
    }); 
}
app.listen(3000, () => {
    console.log('Server started!');
});