/// <reference path="../../typings/index.d.ts" />
import * as express from "express";

import { users as db } from "../modules/db/index";
import { createHashedPassowrd } from "../modules/crypto/hash";
import { encoding as ENCODING } from "../../config.js";

let router = express.Router();

/**
 * @api {get} /users Retrieve a list of all users
 * @apiName GetUsers
 * @apiGroup User
 *
 * @apiSuccess (200) {User[]} users
 * An array containing every user. Each user will contain the following properties: id, and name.
 *
 * @apiSuccessExample
 * HTTP 200 OK
 * {
 * 	users: [
 * 		{
 * 			id: 1,
 * 			name: "firstUser"
 * 		}, {
 * 			id: 2
 * 			name: "secondUser"
 * 		}
 * 	]
 * }
 */
router.get("/", (req, res) => {
	db.getAll().then(users => {
		res.status(200).send(JSON.stringify({
			users: users.map(e => ({
				id: e.id,
				name: e.name
			}))
		}));
	}).catch(err => {
		console.error(err);
		res.status(500).send("");
	});
});

router.get("/:id/publicKey", (req, res) => {
	if (req.params.id) {
		db.getPublicKeyById(req.params.id).then(pKey => {
			if (pKey !== null) {
				res.status(200).send(JSON.stringify({
					id: req.params.id,
					publicKey: pKey.toString(ENCODING)
				}));
			} else {
				res.status(422).send(JSON.stringify({
					error: {
						code: "USER_DOESNT_EXIST",
						message: `The user with id ${req.params.id} doesn't exist`
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
				message: "Make sure that you have supplied the user ID"
			}
		}));
	}
});

/**
 * @api {post} /users Create a new user
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiParam {String} username The users's username, which will be used to authenticate.
 * @apiParam {String} password The users's password, which will be used to authenticate.
 * @apiParam {String} publicKey The user's Diffie Hellman public key. The module
 * gma-client-crypto takes care of that.
 *
 * @apiSuccess (201) {number} id The id of the created users.
 * @apiSuccessExample
 * 	HTTP 201 Created
 * 	{
 * 		id: 37
 * 	}
 *
 * @apiError (422) NAME_ALREADY_TAKEN The username is already in use.
 * @apiErrorExample
 * 	HTTP 422 Unprocessable Entity
 * 	{
 * 		code: "NAME_ALREADY_TAKEN",
 * 		message: "The specified username <my_username> is already taken."
 * 	}
 */
router.post("/", (req, res) => {
	if (req.body.username && req.body.password && req.body.publicKey) {
		db.getByUsername(req.body.username).then(user => {
			if (user === null) {
				db.add(
					req.body.username,
					createHashedPassowrd(req.body.password),
					new Buffer(req.body.publicKey, ENCODING)
				).then(id => {
					res.status(201).send(JSON.stringify({
						id: id
					}));
				}).catch(err => {
					console.error(err);
					res.status(500).send("");
				});
			} else {
				res.status(422).send(JSON.stringify({
					error: {
						code: "NAME_ALREADY_TAKEN",
						message: "The specified username " + req.body.username
						+ " is already taken."
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
				message: "Make sure that you have supplied the username, the password, and the" +
				" public key"
			}
		}));
	}
});

export { router as users };