import * as express from 'express';
import { Router, Response, Request } from 'express';
import {QueryAdapterService} from '../business/query-adapter.service'
import ThicknessmeasurementsRouter from './data/thicknessmeasurements'
import ProductsRouter from './data/products'
import NMVRouter from './data/nmv'
const queryAdapter: QueryAdapterService = new QueryAdapterService();

class QueryRouter {
	public router: Router;

	constructor() {
		this.router = express.Router();
	}
	public async routes() {
		this.router.use('/products',ProductsRouter);
		this.router.use('/coatthickness',ThicknessmeasurementsRouter);
		this.router.use('/metalcontracts',NMVRouter);
	}

}

const queryRouter = new QueryRouter();
queryRouter.routes();

export default queryRouter.router;