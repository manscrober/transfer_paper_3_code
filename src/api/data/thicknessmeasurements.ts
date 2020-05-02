import * as express from 'express';
import { Router, Response, Request } from 'express';
import {QueryAdapterService} from '../../business/query-adapter.service'
import { TableQueryHandler } from '../../business/table-query-handler';

const queryAdapter: QueryAdapterService = new QueryAdapterService();

class ThicknessmeasurementsRouter {
	public router: Router;

	constructor() {
		this.router = express.Router();
	}

	public async routes() {
		this.router.route('/old').get(async function (req:Request,res:Response){
			var handler=new TableQueryHandler(req,res,'v_old_thickness');
			handler.getData().then(_=>handler.send());
			
		});
		this.router.route('/new').get(async function (req:Request,res:Response){
			var handler=new TableQueryHandler(req,res,'v_new_thickness');
			handler.getData().then(_=>handler.send());
			
		});
		this.router.route('/norm').get(async function (req:Request,res:Response){
			var handler=new TableQueryHandler(req,res,'v_norm');
			handler.getData().then(_=>handler.send());
		});
	}

}

const coatRouter = new ThicknessmeasurementsRouter();
coatRouter.routes();

export default coatRouter.router;