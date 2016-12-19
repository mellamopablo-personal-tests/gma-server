/// <reference path="../../typings/index.d.ts" />
import * as express from "express";

import { user } from "./user";
import { login } from "./login";

let router = express.Router();

router.use("/login", login);
router.use("/user", user);

export { router as api };