    
var connection = require('../core/knex');

export default class QueryBuilderService {

	public execQuery(tblName: string,filterstring:string,params:Object): any {
		var result:any[] = [];
		console.log(connection.whereRaw(filterstring,params).from(tblName).toSQL().sql,params)
		return connection.whereRaw(filterstring,params).from(tblName);
	}
}