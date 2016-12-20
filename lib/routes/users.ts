/// <reference path="../../typings/index.d.ts" />
import * as express from "express";

import { users as db } from "../modules/db/index";
import { createHashedPassowrd } from "../modules/crypto/hash";

let router = express.Router();

/**
 * @api {get} /users Retrieves a list of all users
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

/**
 * @api {post} /users Create a new user
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiParam {String} username The users's username, which will be used to authenticate.
 * @apiParam {String} password The users's password, which will be used to authenticate.
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
	if (req.body.username && req.body.password) {
		db.getByUsername(req.body.username).then(user => {
			if (user === null) {
				db.add(req.body.username, createHashedPassowrd(req.body.password)).then(id => {
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
				message: "Either the username or the password, or both, are missing."
			}
		}));
	}
});

export { router as users };