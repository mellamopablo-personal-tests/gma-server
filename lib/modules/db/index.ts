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

	add: function (
		username: string, password: HashedPassword, publicKey: Buffer
	): Promise<number> {
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

export const sessions = {
	/**
	 * Creates a new session token and stores it to the database.
	 *
	 * @param user
	 * @param ip The user's remote address
	 * @returns {Promise<string>|Promise} Returns the token on success.
	 */
	add: function(user: User, ip: string): Promise<string> {
		return new Promise((fulfill, reject) => {
			let token = crypto.randomBytes(20).toString("hex");
			let timestamp = Math.floor(Date.now() / 1000);

			db("sessions").insert({
				token: token,
				time: timestamp,
				userid: user.id,
				ip: ip
			}).then(() => {
				fulfill(token);
			}).catch(reject);
		});
	},

	validate: function(token: string, ip: string): Promise<number|null> {
		return new Promise((fulfill, reject) => {
			db("sessions").select(["userid", "time"]).where({
				token: token,
				ip: ip
			}).then(rows => {
				// TODO add session length
				fulfill(rows.length > 0 ? rows[0].userid : null);
			}).catch(reject);
		});
	}
};

export const config = {
	diffieHellman: {
		getConfig: function() {
			return new Promise((fulfill, reject) => {
				db("config").select(["dhprime", "dhgenerator"]).then(rows => {
					fulfill(rows[0] ? rows[0] : null);
				}).catch(reject);
			});
		},

		setConfig: function (prime: Buffer, generator: Buffer) {
			return new Promise((fulfill, reject) => {
				db("config").update({
					dhprime: prime,
					dhgenerator: generator
				}).then(fulfill).reject();
			});
		}
	}
};