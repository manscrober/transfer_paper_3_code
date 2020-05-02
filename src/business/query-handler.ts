import { QueryAdapterService, ParamterizedFilterString } from './query-adapter.service';
import QueryBuilderService from '../persistence/query-builder.service';
import { isNull } from 'util';


export abstract class QueryHandler{
    req;
    res;
    table:string;
    result;
    startdate:number;
    protected queryAdapter: QueryAdapterService;
	protected queryBuilder:QueryBuilderService;
    constructor(req,res,table:string){
        this.req=req;
        this.res=res;
        this.table=table;
        this.queryBuilder=new QueryBuilderService();
        this.queryAdapter= new QueryAdapterService();
    }
    public async getData(){
        this.startdate=Date.now();
        var filter:ParamterizedFilterString = this.queryAdapter.getFilter(this.req.query,this.table);
        if(isNull(filter)){
            this.result=[];
            return;
        }
        var query=this.queryBuilder.execQuery(this.table, filter.filter,filter.params);
        var result:any[] = [];
        return query.then(rows => {
            rows.forEach((row) => {
                result.push(row);
            });
            console.log(rows.length);
            this.result=result;
        });
    }
}