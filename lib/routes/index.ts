/// <reference path="../../typings/index.d.ts" />
import * as express from "express";

import { users } from "./users";
import { auth } from "./auth";
import { messages } from "./messages";

let router = express.Router();

router.use("/auth", auth);
router.use("/users", users);
router.use("/messages", messages);

export { router as api };