module.exports = {
	db: {
		host: "localhost",
		user: "pablo",
		database: "gma",
		password: "1234abcd"
	},
	encoding: "base64",
	session_length: 60 /*s*/ * 60 /*m*/,
	extended_session_length: 60 /*s*/ * 60 /*m*/ * 24 /*h*/ * 30 /*d*/,
	dh_prime_length: 512,
	port: 3000,
	AccessControlAllowOrigin: "*"
};
