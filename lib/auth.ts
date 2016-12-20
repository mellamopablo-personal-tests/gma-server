/// <reference path="../typings/index.d.ts" />
import { sessions as db } from "./modules/db/index";

let authenticate = function(req, res, next) {
	if (req.headers.token) {
		db.validate(req.headers.token, req.connection.remoteAddress).then(userId => {
			if (userId !== null) {
				req.authenticated = true;
				req.userId = userId;

				console.log(`${req.connection.remoteAddress} authenticated as user ${userId}.`);

				next();
			} else {
				req.authenticated = false;
				next();
			}
		}).catch(err => {
			console.error(err);
			res.status(500).send("");
		});
	} else {
		req.authenticated = false;
		next();
	}
};

export { authenticate };