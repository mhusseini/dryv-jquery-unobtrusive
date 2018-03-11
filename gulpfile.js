const gulp = require("gulp");
const ts = require("gulp-typescript");
const uglify = require("gulp-uglify");
const pump = require("pump");
const rename = require("gulp-rename");
const replace = require("gulp-replace");

gulp.task("default", ["build-module", "build-browser"]);

gulp.task("build-module", done => {
    build("umd", "dryv-jquery-unobtrusive", done, 'import * as $ from "jquery";');
});

gulp.task("build-browser", done => {
    build("none", "dryv-jquery-unobtrusive.browser", done, '///<reference types="jquery" />');
});

function build(moduleType, basename, done, importCommand) {
    const tsProject = ts.createProject("tsconfig.json", { module: moduleType });
    const streams = [
        gulp.src("src/**/*.ts"),
        replace('///<reference types="jquery" />', importCommand),
        replace(/\/\/\/.*/g, ""),
        tsProject(),
        rename({ basename: basename }),
        gulp.dest("dist"),
        uglify(),
        rename({ suffix: ".min" }),
        gulp.dest("dist")
    ];

    return pump(streams, done);
}
