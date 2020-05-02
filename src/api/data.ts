import * as express from 'express';
import { Router, Response, Request } from 'express';
import {QueryAdapterService} from '../business/query-adapter.service'
import CoatRouter from './data/coatthickness'

const queryAdapter: QueryAdapterService = new QueryAdapterService();

class QueryRouter {
	public router: Router;

	constructor() {
		this.router = express.Router();
	}
	public async routes() {
		this.router.route('/productlist').get(async function (req: Request, res: Response) {
			queryAdapter.execQuery(req.query,res,'v_basic_vulk_data');
		});
		this.router.use('/coatthickness',CoatRouter)
	}

}

const queryRouter = new QueryRouter();
queryRouter.routes();

export default queryRouter.router;