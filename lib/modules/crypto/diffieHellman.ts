import { createDiffieHellman } from "crypto";

import { config as db } from "../db/index";
import { dh_prime_length as PRIME_LENGTH } from "../../../config.js";

function generatePrime(): Buffer {
	const dh = createDiffieHellman(PRIME_LENGTH);
	return dh.getPrime();
}

/**
 * Checks whether or not the prime has been calculated and saved to the database.
 * If it has, it does nothing. If it hasn't, it saves it.
 */
export function checkPrime() {
	return new Promise((fulfill, reject) => {
		db.diffieHellman.getPrime().then(prime => {
			if (prime === null) {
				let newPrime: Buffer;

				try {
					console.log("No prime was found in the database. Generating a new one.");
					newPrime = generatePrime();
				} catch (e) {
					reject(e);
				}

				console.log("Finished generating new prime.");

				return db.diffieHellman.addPrime(newPrime);
			}
		}).then(fulfill).catch(reject);
	});
}