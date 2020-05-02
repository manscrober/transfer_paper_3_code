    
var connection = require('../core/knex');

export default class QueryBuilderService {

	public execQuery(tblName: string,filterstring:string,params:Object): Promise<Object[]> {
		var result:any[] = [];
		
		console.log(connection.whereRaw(filterstring,params).from(tblName).toSQL())
		return connection.whereRaw(filterstring,params).from(tblName).then(rows => {
				rows.forEach((row) => {
					result.push(row);
				});
			return result;
		});
	}
}