import * as express from 'express';
import { Application, Router, Response, Request, NextFunction } from 'express';

import AuthRouter from './auth';
import Error from '../models/error';

import QueryRouter from './data';
import UserDB from '../core/userDB';

export default function Routes(app: Application) {
	const router: Router = express.Router();

	
	
	// setup api endpoints
	
	app.use('/',function(req,res,next){
		console.log(req.method+" "+req.url+" requested by "+req.ip);
		next();
	})
	app.use(AuthRouter);
	
	app.use('/api/data', QueryRouter);
	// catch 404 and forward to error handler
	app.use('/', function (req: Request, res: Response, next: NextFunction) {
		var err = new Error(req.url+' Not Found');
		err.status = 404;
		console.log(err);
		next(err);
	});

	// error handler
	app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};

		// render the error page
		res.status(err.status || 500);
		res.send();
	});
	UserDB.initUserDB();
	setInterval(UserDB.cleanUp,36000000);
}