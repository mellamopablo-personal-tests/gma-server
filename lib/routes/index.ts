/// <reference path="../../typings/index.d.ts" />
import * as express from "express";

import { users } from "./users";
import { login } from "./login";
import { messages } from "./messages";

let router = express.Router();

router.use("/login", login);
router.use("/users", users);
router.use("/messages", messages);

export { router as api };