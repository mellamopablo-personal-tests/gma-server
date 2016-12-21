/// <reference path="../../../typings/index.d.ts" />
import * as crypto from "crypto";

const ENCODING_ALGORITHM = "base64";
const DIFFIE_HELLMAN_LENGTH = 512;

/**
 * Generates a public key for the Diffie Hellman key pair, based on the user password.
 * The public key is then stored in the database.
 *
 * @param password
 * @returns {string}
 */
let genPublicKey = function(password: string): string {
	let privateKey = new Buffer(password);

	const dh = crypto.createDiffieHellman(DIFFIE_HELLMAN_LENGTH);
	dh.setPrivateKey(privateKey);
	const publicKey = dh.generateKeys();

	return publicKey.toString(ENCODING_ALGORITHM);
};

export { genPublicKey };