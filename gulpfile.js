const gulp = require("gulp");
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');
const pump = require('pump');
const rename = require("gulp-rename");

gulp.task("build", done => {
    const tsProject = ts.createProject("tsconfig.json");
    pump([
        gulp.src("src/**/*.ts"),
        tsProject(),
        gulp.dest("dist"),
        uglify(),
        rename({ suffix: ".min" }),
        gulp.dest("dist")
    ], done);
});