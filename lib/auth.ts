/// <reference path="../typings/index.d.ts" />
import { sessions as db } from "./modules/db/index";

export function authenticate(req, res, next) {
	if (req.headers.token) {
		db.validate(req.headers.token, req.connection.remoteAddress).then(userId => {
			if (userId !== null) {
				req.authenticated = true;
				req.userId = userId;

				console.log(`Authenticated request - ` +
					`${req.connection.remoteAddress} as user ${userId}:`);

				db.refresh(req.headers.token, req.connection.remoteAddress).then(timestamp => {
					res.setHeader("Session-Valid-Until", timestamp.toString());
					next();
				}).catch(err => {
					console.error(err);
					res.status(500).send("");
				});
			} else {
				req.authenticated = false;

				console.log("Unauthenticated request: ");
				next();
			}
		}).catch(err => {
			console.error(err);
			res.status(500).send("");
		});
	} else {
		req.authenticated = false;

		console.log("Unauthenticated request: ");
		next();
	}
}