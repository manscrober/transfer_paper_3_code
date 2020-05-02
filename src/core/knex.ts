module.exports=require('knex')({
    client: 'mssql',
  connection: {
    host : 'databasehost',
    user : 'username',
    password : 'password',
    database : 'databasename'
  }
})
