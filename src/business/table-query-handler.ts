import { QueryHandler } from './query-handler';
import { ParamterizedFilterString } from './query-adapter.service';
import { isNull } from 'util';
export class TableQueryHandler extends QueryHandler{
    constructor(req,res,table:string){
        super(req,res,table);
    }
    public send(){
        this.res.send(this.result);
        console.log("result served in "+(Date.now()-this.startdate)+"ms")
    }
}