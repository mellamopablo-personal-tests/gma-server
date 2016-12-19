/// <reference path="../../typings/index.d.ts" />
import * as express from "express";

import { users, sessions } from "../modules/db";
import { verifyPassword } from "../modules/crypto/hash";

let router = express.Router();

/**
 * @api {post} /login Log in and get a session token
 * @apiName Login
 * @apiGroup Login
 *
 * @apiParam {String} username The user's username.
 * @apiParam {String} password The user's password.
 *
 * @apiSuccess (200) {String} token
 * The token to be used to authenticate on the rest of the api methods.
 * @apiSuccessExample
 * 	HTTP 200 OK
 * 	{
 * 		token: "f642ea30f581a78f778bc4010df0bf8e9a177bb7"
 * 	}
 *
 * @apiError (401) WRONG_USERNAME_OR_PASSWORD
 * Either the username doesn't exist or the password for the specified user is incorrect.
 * @apiErrorExample
 * 	HTTP 401 Unauthorized
 * 	{
 * 		code: "WRONG_USERNAME_OR_PASSWORD",
 * 		message: "The entered username or password are incorrect."
 * 	}
 */
router.post("/", (req, res) => {
	if (req.body.username && req.body.password) {
		users.getByUsername(req.body.username).then(user => {
			if (user !== null && verifyPassword(req.body.password, user.password)) {
				sessions.add(user).then(token => {
					res.status(200).send(JSON.stringify({
						token: token
						// TODO maybe add valid until
					}));
				}).catch(err => {
					console.error(err);
					res.status(500).send("");
				});
			} else {
				res.status(401).send(JSON.stringify({
					error: {
						code: "WRONG_USERNAME_OR_PASSWORD",
						message: "The entered username or password are incorrect."
					}
				}));
			}
		}).catch(err => {
			console.error(err);
			res.status(500).send("");
		});
	} else {
		res.status(400).send(JSON.stringify({
			error: {
				code: "BAD_REQUEST",
				message: "Either the username or the password, or both, are missing from the" +
				" request body."
			}
		}));
	}
});

export { router as login };