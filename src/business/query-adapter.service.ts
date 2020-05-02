import QueryBuilderService from '../persistence/query-builder.service';
import { Router, Response, Request } from 'express';
import * as moment from 'moment';

const columnList={
	itemID:"itemID",
	counter:"counter",
	vexID:"vexID",
	orderNum:"orderNum",
	bdeID:"bdeID",
	vulkDate:"vulkDate",
	blankRubberManufactured:"blankRubberManufactured",
}
export class QueryAdapterService {
	private queryBuilder: QueryBuilderService;

	constructor() {
		this.queryBuilder = new QueryBuilderService();
	}
	
	public async execQuery(filter:Object,res:Response,table:string) {
		let startdate=Date.now();
		let promise = new Promise((resolve, reject) => {
			resolve(async function (context){
				if(Object.keys(filter).length<1)return [];
				let columns:Array<string>=Object.keys(filter).map(c=>columnList[c]);
				let items:Array<any>=Object.values(filter);
				//filter array has to be transposed because url parameters
				items=items[0].map((_,column)=>(items.map(row=>row[column])))//transpose filter.
				let params=new Object();
				let filterstring:string=Object.keys(items).map(k=>
					"("+
					Object.keys(items[k]).map(v=>{
						if(QueryAdapterService.prototype.isDaterange(items[k][v])){//if the value is a date (can only be range) split the string
							params[columns[v]+k]=QueryAdapterService.prototype.getDateFromRange(items[k][v],0);
							params[columns[v]+k+'b']=QueryAdapterService.prototype.getDateFromRange(items[k][v],1);	//TODO: see if this works as intended(to be defined) when the to date is not entered(i.e. it's not a range)
						}else{
							params[columns[v]+k]=items[k][v];//else just add the entire string to the params
						}
						let condition;
						if(QueryAdapterService.prototype.isDaterange(items[k][v])){//if the value is a date (can only be range) use between syntax
							condition="cast("+columns[v] + " as date) between :" + columns[v] + k +" and :"+columns[v]+k+'b'
						}else{
							condition = columns[v]+(items[k][v]=='null'? " is null":(" = :"+columns[v]+k));
						}
						return condition;
					}).join(" and ")+
					")"
				).join(" or ");
				let promise = new Promise<Object[]>((resolve, reject) => {
					return resolve(context.queryBuilder.execQuery(table, filterstring,params))
				});
				return await promise;
			}(this));
		});
		res.send(await promise);
		console.log("query completed after "+(Date.now()-startdate)+"ms");
	}

	//returns true if there is a valid date string before 'TO' or the end of the string
	isDaterange(s:string){
		return moment(s.substring(0,s.indexOf('TO')),"YYYY-MM-DD").isValid()
	}

	//index can be 0 or 1, being the from or to date
	getDateFromRange(s:string,index:number=0){
		if(index==0){
			return s.substring(0,s.indexOf('TO'));
		}else{
			return s.substring(s.indexOf('TO')+2);
		}
	}
}