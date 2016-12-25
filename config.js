module.exports = {
	db: {
		host: "",
		user: "",
		database: "",
		password: ""
	},
	encoding: "base64",
	session_length: 60 /*s*/ * 60 /*m*/,
	extended_session_length: 60 /*s*/ * 60 /*m*/ * 24 /*h*/ * 30 /*d*/,
	dh_prime_length: 2048
};