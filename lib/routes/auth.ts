/// <reference path="../../typings/index.d.ts" />
import * as express from "express";

import { users, sessions, config } from "../modules/db/index";
import { verifyPassword } from "../modules/crypto/hash";

let router = express.Router();

/**
 * @api {get} /auth/prime Retrieve the Diffie Hellman prime
 *
 * @apiName GetPrime
 * @apiGroup Auth
 *
 * @apiDescription
 * Retrieves the prime needed for the Diffie Hellman key exchange. This is handled by the
 * gma-client-crypto module.
 */
router.get("/prime", (req, res) => {
	config.diffieHellman.getPrime().then(prime => {
		res.status(200).send(JSON.stringify({
			prime: prime
		}));
	}).catch(err => {
		console.error(err);
		res.status(500).send("");
	});
});

/**
 * @api {post} /auth/login Retrieve a session token
 *
 * @apiName Login
 * @apiGroup Auth
 * @apiDescription
 * The login method is used to retrieve a session token by sending the user credentials. The
 * session token is then sent as a header in subsequent requests that require authentication.
 * The session token lasts for the amount of time defined in the configuration file, and the
 * duration is refreshed on each authenticated request.
 *
 * Your application should be ready to handle a 401 Unauthorized request, result of the session
 * token expiring, at any time. If that happens, use this method again.
 *
 * @apiParam {String} username The users's username.
 * @apiParam {String} password The users's password.
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
 * Either the username doesn't exist or the password for the specified users is incorrect.
 * @apiErrorExample
 * 	HTTP 401 Unauthorized
 * 	{
 * 		code: "WRONG_USERNAME_OR_PASSWORD",
 * 		message: "The entered username or password are incorrect."
 * 	}
 */
router.post("/login", (req, res) => {
	if (req.body.username && req.body.password) {
		users.getByUsername(req.body.username).then(user => {
			if (user !== null && verifyPassword(req.body.password, user.password)) {
				sessions.add(user, req.connection.remoteAddress).then(token => {
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

export { router as auth };