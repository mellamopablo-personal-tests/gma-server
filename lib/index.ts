/// <reference path="../typings/index.d.ts" />
import * as https from "https";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as morgan from "morgan";

import { api } from "./routes/index";
import { authenticate } from "./middleware/auth";
import { originControl } from "./middleware/originControl";
import { checkPrime } from "./modules/crypto/diffieHellman";
import { config as db } from "./modules/db";

import { port as PORT } from "../config.js";

let app = express();
let port = PORT || +process.argv[2] || +process.env.PORT || 3000;

checkPrime().catch(console.error);

//noinspection TypeScriptValidateTypes
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(authenticate);
app.use(originControl);
app.use("/api/v1", api);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err);
	//noinspection TypeScriptUnresolvedFunction,TypeScriptUnresolvedVariable
	res.status(err.status || 500).send(""); // adding the err param breaks type definitions
});

// If no requests are accepted, fallback to 404
app.use((req, res) => {
	res.status(404).send("");
});

db.certs.get().then(certs => {
	let options: any = {};

	if (certs) {
		options.key = certs.privateKey;
		options.cert = certs.cert;
	} else {
		console.warn("Warning! Not using SSL!");
	}

	https.createServer(options, app).listen(port, () => {
		console.log("Listening on port " + port);
	})
}).catch(console.error);