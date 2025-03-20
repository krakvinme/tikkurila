'use strict';
var path = {
    build: {
        html: 'docs/',
        js: 'docs/js/',
        js_libs: 'docs/js/libs/',
        css: 'docs/css/',
        img: 'docs/img/',
        imgWebp: 'docs/img/webp/',
        favicon: 'docs/favicon/',
        fonts: 'docs/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/interface.js',
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*',
        favicon: 'src/favicon/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/*.js',
        css: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        favicon: 'src/favicon/**/*.*',
        fonts: 'srs/fonts/**/*.*'
    },
    libs: {
        js: 'src/js/libs/*.js',
        style: 'src/style/libs.scss',
    },
    clean: './docs/*'
};


var config = {
    server: {
        baseDir: './docs'
    },
    notify: false
};


import gulp from 'gulp'
import webserver from 'browser-sync'
import plumber from 'gulp-plumber'
import concat from 'gulp-concat'
import rigger from 'gulp-rigger'
import sourcemaps from 'gulp-sourcemaps'
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer'
import cleanCSS from 'gulp-clean-css'
import uglify from 'gulp-uglify'
import cache from 'gulp-cache'
import imagemin from 'gulp-imagemin'
import jpegrecompress from 'imagemin-jpeg-recompress'
import pngquant from 'imagemin-pngquant'
import del from 'del'
import rename from 'gulp-rename'
import htmlmin from 'gulp-htmlmin'
import webp from 'gulp-webp';

const sass = gulpSass(dartSass);


gulp.task('webserver', function () {
    webserver(config);
});


gulp.task('html:build', function () {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(path.build.html))
        .pipe(webserver.reload({ stream: true }));
});

gulp.task('css:build', function () {
    return gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest(path.build.css))
        //.pipe(rename({ suffix: '.min' }))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({ stream: true }));
});
gulp.task('css_libs:build', function () {
    return gulp.src(path.libs.style)
        .pipe(plumber())
        //.pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        //.pipe(gulp.dest(path.build.css))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleanCSS())
        //.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({ stream: true }));
});

gulp.task('js:build', function () {
    return gulp.src([
            path.src.js,
        ])
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        //.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.build.js))
        .pipe(webserver.reload({ stream: true }));
});

gulp.task('favicon:build', function() {
    return gulp.src(path.src.favicon)
        .pipe(gulp.dest(path.build.favicon));
});


gulp.task('libs:build', function () {
    return gulp.src([
            path.libs.js
        ])
        .pipe(plumber())
        .pipe(concat('libs.js'))

        //.pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        //.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.build.js_libs))
        .pipe(webserver.reload({ stream: true }));
});


gulp.task('fonts:build', function () {
    return gulp.src(path.src.fonts,{ encoding: false })
        .pipe(gulp.dest(path.build.fonts));
});


gulp.task('image:build', function () {
    return gulp.src(path.src.img, { encoding: false })
        .pipe(cache(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            jpegrecompress({
                progressive: true,
                max: 90,
                min: 80
            }),
            pngquant(),
            imagemin.svgo({ plugins: [{ removeViewBox: false }] })
        ])))
        .pipe(gulp.dest(path.build.img))
        // .pipe(webp())
        // .pipe(gulp.dest(path.build.imgWebp));
});


gulp.task('clean:build', function () {
    return del(path.clean);
});


gulp.task('cache:clear', function () {
    cache.clearAll();
});


gulp.task('build',
    gulp.series('clean:build',
        gulp.parallel(
            'html:build',
            'css:build',
            // 'css_libs:build',
            // 'libs:build',
            'js:build',
            'fonts:build',
            'favicon:build',
            'image:build'
        )
    )
);

gulp.task('watch', function () {
    gulp.watch(path.watch.html, gulp.series('html:build'));//+++
    //gulp.watch(path.watch.css, gulp.series('css_libs:build'));
    gulp.watch(path.watch.css, gulp.series('css:build'));
    //gulp.watch(path.libs.js, gulp.series('libs:build'));//+++
    gulp.watch(path.watch.js, gulp.series('js:build'));//+++
    gulp.watch(path.watch.img, gulp.series('image:build'));
    gulp.watch(path.watch.fonts, gulp.series('fonts:build'));
    gulp.watch(path.watch.favicon, gulp.series('favicon:build'));
});

gulp.task('default', gulp.series(
    'build',
    gulp.parallel('webserver','watch')      
));
