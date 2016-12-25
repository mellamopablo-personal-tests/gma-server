/// <reference path="../../../typings/index.d.ts" />
import * as cfg from "../../../config.js";
import * as knex from "knex";
import * as crypto from "crypto";

import { HashedPassword } from "../crypto/hash";

const db = knex({
	client: "pg",
	connection: {
		host : cfg.db.host,
		user : cfg.db.user,
		password : cfg.db.password,
		database : cfg.db.database
	}
});

interface User {
	id: number;
	name: string;
	password?: HashedPassword;
	publicKey?: Buffer;
}

export const users = {
	RELEVANT_INFO: ["id", "username", "password"],

	/**
	 * Gets an users from the database
	 *
	 * @param id
	 * @returns {Promise<User|null>|Promise} Returns the User object or null if it doesn't exist.
	 */
	getById: function (id: number): Promise<User|null> {
		return new Promise((fulfill, reject) => {
			db("users").select(this.RELEVANT_INFO).where({
				id: id
			}).then(rows => {
				fulfill(
					rows[0]
						? {
							id: rows[0].id,
							name: rows[0].username,
							password: rows[0].password
						}
						: null
				);
			}).catch(reject);
		});
	},

	/**
	 * Get by username
	 *
	 * @param username
	 * @returns {Promise<User|null>|Promise} Returns the User object or null if it doesn't exist.
	 */
	getByUsername: function (username: string): Promise<User|null> {
		return new Promise((fulfill, reject) => {
			db("users").select(this.RELEVANT_INFO).where({
				username: username
			}).then(rows => {
				fulfill(
					rows[0]
						? {
							id: rows[0].id,
							name: rows[0].username,
							password: rows[0].password
						}
						: null
				);
			}).catch(reject);
		});
	},

	getAll: function(): Promise<User[]> {
		return new Promise((fulfill, reject) => {
			db("users").select(this.RELEVANT_INFO).then(rows => {
				if (rows.length === 0) {
					fulfill([]);
				} else {
					let result = [];
					for (let i = 0; i < rows.length; i++) {
						result.push({
							id: rows[i].id,
							name: rows[i].username
						});
					}
					fulfill(result);
				}
			}).catch(reject);
		});
	},

	getPublicKeyById: function (id: number): Promise<Buffer|null> {
		return new Promise((fulfill, reject) => {
			db("users").select("public_key").where({
				id: id
			}).then(rows => {
				fulfill(rows[0] ? rows[0].public_key : null);
			}).catch(reject);
		});
	},

	add: function (username: string, password: HashedPassword, publicKey: Buffer): Promise<number> {
		return new Promise((fulfill, reject) => {
			db("users").insert({
				username: username,
				password: password,
				public_key: publicKey
			}).returning("id").then(rows => {
				return fulfill(rows[0]);
			}).catch(reject);
		});
	}
};

interface Message {
	id: number
	from: number
	to: number
	content: string
}

interface MessageQueryOptions {
	from?: User
	to?: User
}

export const messages = {
	add: function(to: User, from: User, content: string): Promise<{}> {
		return new Promise((fulfill, reject) => {
			db("messages").insert({
				to: to.id,
				from: from.id,
				content: content
			}).then(fulfill).catch(reject);
		});
	},

	get: function(options: MessageQueryOptions): Promise<Message[]> {
		return new Promise((fulfill, reject) => {
			db("messages").select().where(options).then(messages => {
				if (messages.length === 0) {
					fulfill([]);
				} else {
					let result: Message[] = [];

					for (let i = 0; i < messages.length; i++) {
						result.push({
							id: messages[i].id,
							from: messages[i].from,
							to: messages[i].to,
							content: messages[i].content
						});
					}

					fulfill(result);
				}
			}).catch(reject);
		});
	}
};

interface SessionCreationResponse {
	token: string
	expiration_time: number
}

export const sessions = {
	/**
	 * Creates a new session token and stores it to the database.
	 *
	 * @param user
	 * @param ip The user's remote address
	 * @param extended Whether or not the requested session is extended
	 * @returns {Promise<SessionCreationResponse>}
	 */
	add: function(user: User, ip: string, extended: boolean): Promise<SessionCreationResponse> {
		return new Promise((fulfill, reject) => {
			let token = crypto.randomBytes(20).toString(cfg.encoding);
			let timestamp = Math.floor(Date.now() / 1000);

			db("sessions").insert({
				token: token,
				time: timestamp,
				userid: user.id,
				ip: ip,
				extended: extended
			}).then(() => {
				fulfill({
					token: token,
					expiration_time: timestamp + (extended
						? cfg.extended_session_length
						: cfg.session_length)
				});
			}).catch(reject);
		});
	},

	deleteToken: function(token: string, ip: string) {
		return new Promise((fulfill, reject) => {
			db("sessions").del().where({
				token: token,
				ip: ip
			}).then(fulfill).catch(reject);
		});
	},

	validate: function(token: string, ip: string): Promise<number|null> {
		return new Promise((fulfill, reject) => {
			let timestamp = Math.floor(Date.now() / 1000);

			db("sessions").select(["userid", "time", "extended"]).where({
				token: token,
				ip: ip
			}).then(rows => {
				if (rows.length > 0) {
					if (rows[0].time > timestamp - (rows[0].extended
							? cfg.extended_session_length
							: cfg.session_length)) {
						// The session is still valid
						fulfill(rows[0].userid);
					} else {
						// The session has expired. Fulfill null and delete the token
						sessions.deleteToken(token, ip).catch(reject);
						fulfill(null);
					}
				} else {
					// The token doesn't exist
					fulfill(null);
				}
			}).catch(reject);
		});
	},

	/**
	 * Updates a given token's time to the current timestamp. This assumes that the token and ip
	 * are valid and exist in the database, so they must be checked with validate() first.
	 *
	 * @param token
	 * @param ip The user's remote address
	 * @returns {Promise<number>} A promise with the new timestamp
	 */
	refresh: function(token: string, ip: string): Promise<number> {
		return new Promise((fulfill, reject) => {
			let timestamp = Math.floor(Date.now() / 1000);

			db("sessions").update({
				time: timestamp
			}).where({
				token: token,
				ip: ip
			}).returning(["extended"]).then(rows => {
				fulfill(timestamp + (rows[0].extended
						? cfg.extended_session_length
						: cfg.session_length))
			}).catch(reject);
		});
	}
};

export const config = {
	diffieHellman: {
		/**
		 * Retrieves the prime from the database. Returns it as a Buffer, or null if not found.
		 * @returns {Promise<Buffer>|Promise}
		 */
		getPrime: function(): Promise<Buffer|null> {
			return new Promise((fulfill, reject) => {
				db("config").select("dh_prime").then(rows => {
					fulfill(rows[0] ? rows[0].dh_prime : null);
				}).catch(reject);
			});
		},

		addPrime(prime: Buffer) {
			return new Promise((fulfill, reject) => {
				db("config").insert({
					dh_prime: prime.toString("base64")
				}).then(fulfill).catch(reject);
			});
		}
	}
};