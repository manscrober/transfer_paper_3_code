import * as express from 'express';
import { Application } from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as cors from 'cors';

import routes from '../api';

const whitelist = ['http://localhost:4200','https://localhost:3000', 'http://hhl0069w.tiretech2.contiwan.com:4200'];

class App {
	corsOptions = {/*
		origin: function (origin, callback) {
			 if (whitelist.indexOf(origin) !== -1) {
				 callback(null, true)
			 } else {
				 callback(new Error('Not allowed by CORS'))
			 }
		 },
		 optionsSuccessStatus: 200
	 */
	 }
	constructor() {
		this.app = express();
		this.config();
		routes(this.app);
	}

	public app: Application;

	private config(): void {
		this.app.use(cors(this.corsOptions));
		this.app.use(express.static(path.join(__dirname, '../', 'api')));
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: false }));
	}
}

export default new App().app;