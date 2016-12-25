/// <reference path="../../typings/index.d.ts" />
import * as express from "express";

import * as cfg from "../../config.js";
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
			prime: prime.toString(cfg.encoding)
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
 * Whenever you authenticate by sending the token, the server responds with the
 * "Session-Valid-Until" header, which contains a timestamp of the time when the session will
 * expire.
 *
 * Your application should be ready to handle a 401 Unauthorized request, result of the session
 * token expiring, at any time. If that happens, call this method again.
 *
 * A session can be manually terminated by calling the {post} /auth/logout method.
 *
 * @apiParam {String} username The users's username.
 * @apiParam {String} password The users's password.
 * @apiParam {boolean} [extended=false]
 * Whether or not the session is meant to be extended. Extended sessions last longer than
 * regular sessions (their duration is also defined in the config file), and are intended to be
 * explicitly requested by the user (for example, by checking a "remember me" checkbox).
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

				let extended = req.body.extended || false;
				sessions.add(user, req.connection.remoteAddress, extended).then(r => {
					res.setHeader("Session-Valid-Until", r.expiration_time.toString());
					res.status(200).send(JSON.stringify({
						token: r.token
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

/**
 * @api {post} /auth/logout Terminate a session
 * @apiName LogOut
 * @apiGroup Auth
 *
 * @apiHeader {string} token The current session token.
 *
 * @apiSuccessExample
 * HTTP 204 No Content
 */
router.post("/logout", (req, res) => {
	if (req.authenticated) {

		sessions.deleteToken(req.headers.token, req.connection.remoteAddress).then(() => {

			res.removeHeader("Session-Valid-Until");
			res.status(204).send("");

		}).catch(err => {
			console.error(err);
			res.status(500).send("");
		});


	} else {
		res.status(401).send("");
	}
});

export { router as auth };