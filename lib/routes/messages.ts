/// <reference path="../../typings/index.d.ts" />
import * as express from "express";

import { users, messages } from "../modules/db/index";

let router = express.Router();

/**
 * @api {get} /messages Get all messages
 * @apiName GetMessages
 * @apiGroup Messages
 * @apiDescription
 * Retrieves all messages: sent by the user, and sent to the user. Therefore, requires
 * authentication.
 *
 * @apiHeader {string} token The current session token.
 *
 * @apiSuccess (200) {Message[]} messages
 * An array containing every message that matches the request. Message is an object containing
 * {number} id, {number} from, {number} to, and {string} content. From and to are user IDs.
 * @apiSuccessExample
 * HTTP 200 OK
 * {
 * 	messages: [
 * 		{
 * 			id: 43,
 * 			from: 34,
 * 			to: 68,
 * 			content: "Hello!"
 * 		}, {
 * 			id: 44,
 * 			from: 34,
 * 			to: 91,
 * 			content: "How are you?"
 * 		}
 * 	]
 * }
 */
router.get("/", (req, res) => {
	if (req.authenticated) {
		let getSentPromise = messages.get({ from: req.userId });
		let getReceivedPromise = messages.get({ to: req.userId });

		Promise.all([getSentPromise, getReceivedPromise]).then(values => {
			let sent = values[0];
			let received = values[1];

			let result = sent.concat(received).sort((a, b) => a.id - b.id);

			res.status(200).send(JSON.stringify({
				messages: result
			}));
		}).catch(err => {
			console.error(err);
			res.status(500).send("");
		});
	} else {
		res.status(401).send("");
	}
});

/**
 * @api {get} /messages/sent Get sent messages
 * @apiName GetSentMessages
 * @apiGroup Messages
 *
 * @apiHeader {string} token The current session token.
 *
 * @apiSuccess (200) {Message[]} messages
 * An array containing every message that matches the request. Message is an object containing
 * {number} id, {number} from, {number} to, and {string} content. From and to are user IDs.
 * @apiSuccessExample
 * HTTP 200 OK
 * {
 * 	messages: [
 * 		{
 * 			id: 43,
 * 			from: 34,
 * 			to: 68,
 * 			content: "Hello!"
 * 		}, {
 * 			id: 44,
 * 			from: 34,
 * 			to: 91,
 * 			content: "How are you?"
 * 		}
 * 	]
 * }
 */
router.get("/sent", (req, res) => {
	if (req.authenticated) {
		messages.get({ from: req.userId }).then(messages => {
			res.status(200).send(JSON.stringify({
				messages: messages
			}));
		}).catch(err => {
			console.error(err);
			res.status(500).send("");
		});
	} else {
		res.status(401).send("");
	}
});

/**
 * @api {get} /messages/received Get received messages
 * @apiName GetReceivedMessages
 * @apiGroup Messages
 *
 * @apiHeader {string} token The current session token.
 *
 * @apiSuccess (200) {Message[]} messages
 * An array containing every message that matches the request. Message is an object containing
 * {number} id, {number} from, {number} to, and {string} content. From and to are user IDs.
 * @apiSuccessExample
 * HTTP 200 OK
 * {
 * 	messages: [
 * 		{
 * 			id: 43,
 * 			from: 34,
 * 			to: 68,
 * 			content: "Hello!"
 * 		}, {
 * 			id: 44,
 * 			from: 34,
 * 			to: 91,
 * 			content: "How are you?"
 * 		}
 * 	]
 * }
 */
router.get("/received", (req, res) => {
	if (req.authenticated) {
		messages.get({ to: req.userId }).then(messages => {
			res.status(200).send(JSON.stringify({
				messages: messages
			}));
		}).catch(err => {
			console.error(err);
			res.status(500).send("");
		});
	} else {
		res.status(401).send("");
	}
});

/**
 * @api {get} /messages/conversations/:userId Get a conversation
 * @apiName GetConversation
 * @apiGroup Messages
 *
 * @apiHeader {string} token The current session token.
 *
 * @apiParam {number} userId The user ID of the second user in the conversation.
 *
 * @apiSuccess (200) {Message[]} messages
 * An array containing every message that matches the request. Message is an object containing
 * {number} id, {number} from, {number} to, and {string} content. From and to are user IDs.
 * @apiSuccessExample
 * HTTP 200 OK
 * {
 * 	messages: [
 * 		{
 * 			id: 43,
 * 			from: 34,
 * 			to: 68,
 * 			content: "Hello!"
 * 		}, {
 * 			id: 44,
 * 			from: 34,
 * 			to: 91,
 * 			content: "How are you?"
 * 		}
 * 	]
 * }
 */
router.get("/conversations/:user", (req, res) => {
	if (req.authenticated) {
		messages.get({
			from: req.userId,
			to: req.params.user
		}).then(response => {
			res.status(200).send(JSON.stringify({
				messages: response
			}));
		}).catch(err => {
			console.error(err);
			res.status(500).send("");
		});
	} else {
		res.status(401).send("");
	}
});

/**
 * @api {post} /messages Create a new message
 * @apiName CreateMessage
 * @apiGroup Messages
 *
 * @apiHeader {string} token The current session token.
 *
 * @apiParam {number} addressee The addressee's user ID.
 * @apiParam {string} message The message content.
 *
 * @apiSuccessExample
 * HTTP 204 No Content
 */
router.post("/", (req, res) => {
	if (req.authenticated) {
		if (req.body.addressee && req.body.message) {
			let getSenderPromise = users.getById(req.userId);
			let getAddresseePromise = users.getById(req.body.addressee);

			Promise.all([getSenderPromise, getAddresseePromise]).then(values => {
				let sender = values[0];
				let addressee = values[1];

				return messages.add(addressee, sender, req.body.message);
			}).then(() => {
				res.status(204).send("");
			}).catch(err => {
				console.error(err);
				res.status(500).send("");
			});
		} else {
			res.status(400).send(JSON.stringify({
				error: {
					code: "BAD_REQUEST",
					message: "Either the message or the addressee, or both, are missing."
				}
			}));
		}
	} else {
		res.status(401).send("");
	}
});

export { router as messages }