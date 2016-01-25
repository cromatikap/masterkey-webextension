var gulp = require("gulp");

var browserify = require('browserify')
var streamify = require('gulp-streamify')
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var eventstream = require("event-stream");

gulp.task("browserify", function() {
    var files = ['./browser/js/panel.js', './browser/js/contextmenu.js', './browser/js/tab.js']

    var tasks = files.map(function(entry) {
        var name = entry.split("/");
        name = name[name.length-1];
        return browserify({
            entries: [entry]
        }).bundle()
        .pipe(source(name))
        //.pipe(streamify(uglify()))
        .pipe(gulp.dest("./data/js"));
    })

    return eventstream.merge.apply(null, tasks);

    return browserify().bundle()
    .pipe(source("s.js"))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./data/js'));
});

gulp.task("sass", function() {
    return gulp.src("./browser/sass/base.sass")
    .pipe(sass().on("error", sass.logError))
    .pipe(cssnano())
    .pipe(gulp.dest("./data/css"));
});

gulp.task("default", ["browserify", "sass"]);