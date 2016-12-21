/// <reference path="../../../typings/index.d.ts" />
import * as crypto from "crypto";

const SALT_LENGTH = 16;

export interface HashedPassword {
	hash: string,
	salt: string
}

let genSalt = function(length: number): string {
	return crypto.randomBytes(Math.ceil(length/2))
		.toString('hex')
		.slice(0,length);
};

let sha512 = function(password: string, salt: string): HashedPassword {
	let hash = crypto.createHmac('sha512', salt);
	hash.update(password);
	let value = hash.digest("hex");
	return {
		hash: value,
		salt: salt
	}
};

export function createHashedPassowrd(password: string): HashedPassword {
	return sha512(password, genSalt(16));
}

export function verifyPassword(plainTextPassword: string, hashedPassword: HashedPassword): boolean {
	let newHash = sha512(plainTextPassword, hashedPassword.salt);
	return newHash.hash === hashedPassword.hash;
}