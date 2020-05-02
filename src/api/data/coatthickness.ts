import * as express from 'express';
import { Router, Response, Request } from 'express';
import {QueryAdapterService} from '../../business/query-adapter.service'

const queryAdapter: QueryAdapterService = new QueryAdapterService();

class CoatRouter {
	public router: Router;

	constructor() {
		this.router = express.Router();
	}

	public async routes() {
		this.router.route('/old').get(async function (req:Request,res:Response){
			queryAdapter.execQuery(req.query,res,'v_old_thickness');
		});
		this.router.route('/new').get(async function (req:Request,res:Response){
			queryAdapter.execQuery(req.query,res,'v_new_thickness');
		});
		this.router.route('/norm').get(async function (req:Request,res:Response){
			queryAdapter.execQuery(req.query,res,'v_norm');
		});
	}

}

const coatRouter = new CoatRouter();
coatRouter.routes();

export default coatRouter.router;