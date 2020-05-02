import * as express from 'express';
import { Router, Response, Request } from 'express';
import {QueryAdapterService} from '../../business/query-adapter.service'
import { TableQueryHandler } from '../../business/table-query-handler';

const queryAdapter: QueryAdapterService = new QueryAdapterService();

class ProductsRouter {
	public router: Router;

	constructor() {
		this.router = express.Router();
	}

	public async routes() {
		this.router.route('/').get(async function (req: Request, res: Response) {
			var handler=new TableQueryHandler(req,res,'v_basic_vulk_data');
			handler.getData().then(_=>handler.send());
		});
	}

}

const coatRouter = new ProductsRouter();
coatRouter.routes();

export default coatRouter.router;