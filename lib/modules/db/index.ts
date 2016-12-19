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
	password: HashedPassword;
}

const users = {
	/**
	 * Gets an user from the database
	 *
	 * @param id
	 * @returns {Promise<User|null>|Promise} Returns the User object or null if it doesn't exist.
	 */
	getById: function (id: number): Promise<User|null> {
		return new Promise((fulfill, reject) => {
			db("users").select(["username", "password"]).where({
				id: id
			}).then(rows => {
				fulfill(
					rows[0]
						? {
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
			db("users").select(["id", "username", "password"]).where({
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

	add: function (username: string, password: HashedPassword): Promise<number> {
		return new Promise((fulfill, reject) => {
			db("users").insert({
				username: username,
				password: password
			}).returning("id").then(rows => {
				return fulfill(rows[0]);
			}).catch(reject);
		});
	}
};

const sessions = {
	/**
	 * Creates a new session token and stores it to the database.
	 *
	 * @param user
	 * @returns {Promise<string>|Promise} Returns the token on success.
	 */
	add: function(user: User) {
		return new Promise((fulfill, reject) => {
			let token = crypto.randomBytes(20).toString("hex");
			let timestamp = Math.floor(Date.now() / 1000);

			db("sessions").insert({
				token: token,
				time: timestamp,
				userid: user.id
			}).then(() => {
				fulfill(token);
			}).catch(reject);
		});
	}
};

export { users, sessions };