const gulp = require('gulp'),
    rev = require('gulp-rev'),
    revDel = require('gulp-rev-outdated'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    minifyCSS = require('gulp-csso'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync').create(),
    sourcemaps = require('gulp-sourcemaps'),
    revRewrite = require('gulp-rev-rewrite'),
    autoprefixer = require('gulp-autoprefixer');

const path = require('path');
const rimraf = require('rimraf');
const through = require('through2');

function css() {
    return gulp.src('src/css/*.css')
        .pipe(plumber())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('assets/css'));
}

function js() {
    return gulp.src('src/js/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat({
            path: 'app.min.js',
            cwd: ''
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('source-maps'))
        .pipe(gulp.dest('assets/js'));
}

function browser_sync() {
    browserSync.init({
        proxy: 'localhost:' + (process.env.PORT || '3040') + '/manager/dashboard'
    });

    gulp.watch(['assets/css/*.css', 'assets/js/*.js', 'views/*.ejs']).on('change', function() {
        browserSync.reload();
    });
}

function watch() {
    gulp.watch('src/css/*.css', css);
    gulp.watch('src/js/*.js', js);
}

function revReplace() {
    gulp.src(['assets/css/test.css', 'assets/js/app.min.js'], {
            base: 'assets'
        })
        .pipe(gulp.dest('build/assets'))
        .pipe(rev())
        .pipe(gulp.dest('build/assets'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src'));
    gulp.src(['build/assets/js/*.js'], {
            read: false
        })
        .pipe(revDel(1))
        .pipe(cleaner());
    gulp.src(['build/assets/css/*.css'], {
            read: false
        })
        .pipe(revDel(1))
        .pipe(cleaner());
    gulp.src(['build/assets/js/**/*.js.map'], {
            read: false
        })
        .pipe(cleanerRevDel(1))
        .pipe(cleaner());
    let manifest = gulp.src('src/rev-manifest.json');
    return gulp.src('views/layout.ejs')
        .pipe(through.obj(function(file, enc, cb) {
            let contents = file.contents.toString()
            file.contents = Buffer.from(contents.replace(/\-[0-9a-z]+\./, '.'));
            this.push(file);
            cb();
        }))
        .pipe(revRewrite({
            manifest: manifest,
            replaceInExtensions: ['.ejs']
        }))
        .pipe(gulp.dest('build/views'));
}

const normal = gulp.series(gulp.parallel(js, css), gulp.parallel(browser_sync, watch));
const build = gulp.series(gulp.parallel(js, css), revReplace);

gulp.task('default', normal);
gulp.task('build', build);

function cleanerRevDel(keepQuantity) {
    keepQuantity = parseInt(keepQuantity) || 2;
    var lists = {};

    return through.obj(function(file, enc, cb) {
        var regex = new RegExp('^(.*)-[0-9a-f]{8,10}(?:\\.min.js)?\\' + path.extname(file.path) + '$');
        if (regex.test(file.path)) {
            var identifier = regex.exec(file.path)[1] + path.extname(file.path);
            if (lists[identifier] === undefined) {
                lists[identifier] = [];
            }
            lists[identifier].push({
                file: file,
                time: file.stat.ctime.getTime()
            });
        }
        cb();
    }, function(cb) {
        Object.keys(lists).forEach(function(identifier) {
            lists[identifier].sort(function(a, b) {
                    return b.time - a.time;
                })
                .slice(keepQuantity)
                .forEach(function(f) {
                    this.push(f.file);
                }, this);
        }, this);
        cb();
    });
}

function cleaner() {
    return through.obj(function(file, enc, cb) {
        rimraf(path.resolve((file.cwd || process.cwd()), file.path), function(err) {
            if (err) {
                this.emit('error', new Error(err));
            }
            this.push(file);
            cb();
        }.bind(this));
    });
}