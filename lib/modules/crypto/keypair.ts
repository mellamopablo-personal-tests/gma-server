/// <reference path="../../../typings/index.d.ts" />
import * as crypto from "crypto";

import { config as db } from "../db/index";

const DIFFIE_HELLMAN_PRIME_LENGTH = 512;

export interface KeyPair {
	publicKey: Buffer
	privateKey: Buffer
}

interface DiffieHellmanConfig {
	prime: Buffer
	generator: Buffer
}

function genDhConfig(): DiffieHellmanConfig {
	const dh = crypto.createDiffieHellman(DIFFIE_HELLMAN_PRIME_LENGTH);

	return {
		prime: dh.getPrime(),
		generator: dh.getGenerator()
	}
}

export function genKeyPair(): Promise<KeyPair> {
	return new Promise((fulfill, reject) => {
		db.diffieHellman.getConfig().then(config => {
			if (config === null) {
				// If config is null, generate it and then save it to the database.
				config = genDhConfig();
				db.diffieHellman.setConfig(config.prime, config.generator).catch(reject);
			}

			try {
				const dh = crypto.createDiffieHellman(
					config.prime, null, config.generator, null
				);

				dh.generateKeys();

				fulfill({
					publicKey: dh.getPublicKey(),
					privateKey: dh.getPrivateKey(),
				});
			} catch (e) {
				reject(e);
			}
		}).catch(reject);
	});
}