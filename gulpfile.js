"use strict";

const gulp    = require("gulp")
	, apidoc  = require("gulp-apidoc")
	, plumber = require("gulp-plumber")
	, tsc     = require("gulp-typescript")
;

gulp.task("typescript", () => {
	return gulp.src("./lib/**/*.ts")
		.pipe(plumber())
		.pipe(tsc({
			allowJs: true
		}))
		.pipe(gulp.dest("./server/"))
});

gulp.task("docs", done => {
	apidoc({
		config: ".",
		src: "./lib",
		dest: "./docs"
	}, done);
});

gulp.task("default", ["typescript", "docs"]);