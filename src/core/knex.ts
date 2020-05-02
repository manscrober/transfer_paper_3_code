module.exports=require('knex')({
    client: 'mssql',
  connection: {
    host : 'serverhostname',
    user : 'username',
    password : 'password',
    database : 'databasename'
  }
})
