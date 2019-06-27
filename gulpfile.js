const {src, dest, watch} = require('gulp');
const imagemin = require('gulp-imagemin');
const base64img = require('gulp-base64-img');
const responsive = require('gulp-responsive');
const rename = require('gulp-rename');
const node_watch = require('node-watch');
const zip = require('gulp-zip');
const path = require('path');

function renderImages() {
    node_watch(['./working/output/'], {filter: f => path.extname(f) === '', delay: 5000}, function (evt, name) {
        let folders = name.split('/');

        src('./' + name + '/**/*')
        // .pipe(clean())
            .pipe(zip(folders[folders.length - 1] + '.zip'))
            .pipe(dest('./' + name + '/'))
    });

    return src([
        './working/input/**/*.{png,jpg,jpeg}'
    ]).pipe(responsive({
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
    })).pipe(imagemin([
        imagemin.jpegtran({progressive: true, /*arithmetic: true*/}),
        imagemin.optipng({optimizationLevel: 5}),
    ])).pipe(dest('./working/output'))
        .pipe(base64img())
        .pipe(rename({
            extname: ".txt",
        }))
        .pipe(dest('./working/output'));
}

function watchChanges() {
    watch([
        './working/input/**/*.{png,jpg,jpeg}'
    ], exports.images);
}

exports.images = renderImages;

exports.watch = watchChanges;

exports.default = exports.watch;

