/// <reference path="../typings/index.d.ts" />
import * as express from "express";
import * as bodyParser from "body-parser";
import * as morgan from "morgan";

import { api } from "./routes/index";
import { authenticate } from "./auth";
import { checkPrime } from "./modules/crypto/diffieHellman";

let app = express();
let port = +process.env.GMA_PORT || +process.argv[2] || +process.env.PORT || 3000;

checkPrime().catch(console.error);

//noinspection TypeScriptValidateTypes
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(authenticate);
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

app.listen(port, () => {
	console.log("Listening on port " + port);
});