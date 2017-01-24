import { AccessControlAllowOrigin as ACCESS_CONTROL_ALLOW_ORIGIN } from "../../config.js";

export function originControl(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", ACCESS_CONTROL_ALLOW_ORIGIN);
	next();
}