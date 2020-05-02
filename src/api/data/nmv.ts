import * as express from 'express';
import { Router, Response, Request } from 'express';
import { QueryAdapterService, ParamterizedFilterString } from '../../business/query-adapter.service';
import QueryBuilderService from '../../persistence/query-builder.service';
import { QueryHandler } from '../../business/query-handler';
import { TableQueryHandler } from '../../business/table-query-handler';
import { MetalDashQueryHandler } from '../../business/metal-dash-query-handler';


class NMVRouter {
	public router: Router;
	constructor() {
		this.router = express.Router();
	}

	public async routes() {
		this.router.route('/').get(async function (req: Request, res: Response) {
			if(req.query.dashView){
				let handler=new MetalDashQueryHandler(req,res,'v_roll_auftSAP01');
				handler.getData().then(_=>handler.send());
			}else{
				let handler=new TableQueryHandler(req,res,'v_roll_auftSAP01');
				handler.getData().then(_=>handler.send());
			}
		});
	}

}

const coatRouter = new NMVRouter();
coatRouter.routes();

export default coatRouter.router;