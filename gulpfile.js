const {src, dest, series, lastRun, watch, symlink} = require('gulp');
const imagemin = require('gulp-imagemin');
const base64img = require('gulp-base64-img');
const responsive = require('gulp-responsive');
const rename = require('gulp-rename');
const zip = require('gulp-zip');
const path = require('path');
const through = require('through2');
const gutil = require('gulp-util');
const del = require('del');

function optimizeImages() {
    return src([
        './working/input/**/*.{png,jpg,jpeg}'
    ], {since: lastRun(optimizeImages)}).pipe(
        responsive({
            '**/*.{png,jpg,jpeg}': [{
                width: 9,
                quality: 75,
                rename: {
                    suffix: '.blurred'
                }
            }, {
                width: 768,
                quality: 75,
                rename: {
                    suffix: '.mobile'
                }
            }, {
                width: 992,
                quality: 75,
                rename: {
                    suffix: '.tablet'
                }
            }, {
                width: 1200,
                quality: 75,
                rename: {
                    suffix: '.desktop'
                }
            }, {
                quality: 75,
                rename: {
                    suffix: '.source'
                }
            },]
        })
    ).pipe(
        imagemin([
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
        ]), {
            name: 'imagemin'
        }
    ).pipe(dest('./working/output'));
}

function renderBase64() {
    return src([
        './working/output/**/*.blurred.{png,jpg,jpeg}'
    ], {since: lastRun(renderBase64), resolveSymlinks: false}).pipe(base64img()).pipe(rename({
        extname: ".txt",
    })).pipe(dest('./working/output'));
}

function zipFolders() {
    return src([
        './working/output/*/'
    ], {since: lastRun(zipFolders), resolveSymlinks: false}).pipe(through.obj(function (chunk, enc, cb) {
        try {
            const folder = String(chunk.path);
            const name = path.basename(folder);

            src('./working/output/' + name + '/**/*')
                .pipe(zip(name + '.zip'))
                .pipe(dest('./working/output/' + name + '/'))
                .pipe(through.obj(function (chunk, enc, cb2) {
                    cb2(null, chunk);
                    cb(null, chunk);
                }));
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-base64-img', err));
        }
    }));
}

const renderImages = series(optimizeImages, renderBase64, zipFolders);

function watchChanges() {
    return watch([
        './working/input/**/*.{png,jpg,jpeg}'
    ], exports.images);
}

function clear() {
    return del([
        './working/input/**/*',
        './working/output/**/*'
    ])
}

exports.images = renderImages;

exports.watch = series(clear, watchChanges);

exports.default = exports.watch;

