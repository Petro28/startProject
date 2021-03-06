// Імпорт пакетів
const gulp = require('gulp')
const less = require('gulp-less')
const stylus = require('gulp-stylus')
const sass = require('gulp-sass')(require('sass'))
const rename = require('gulp-rename')
const cleanCSS = require('gulp-clean-css')
const ts = require('gulp-typescript')
//const coffee = require('gulp-coffee')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const htmlmin = require('gulp-htmlmin')
const size = require('gulp-size')
//const gulppug = require('gulp-pug')
const newer = require('gulp-newer')
const browsersync = require('browser-sync').create()
const del = require('del')

// Шляхи вихідних файлів src та шляхи до результуючих файлів dest
const paths = {
  html: {
    src: ['src/*.html', 'src/*.pug'],
    dest: 'dist/'
  },
  styles: {
    src: ['src/styles/**/*.sass', 'src/styles/**/*.scss', 'src/styles/**/*.styl', 'src/styles/**/*.less', 'src/styles/**/*.css'],
    dest: 'dist/css/'
  },
  scripts: {
    src: ['src/scripts/**/*.coffee', 'src/scripts/**/*.ts', 'src/scripts/**/*.js'],
    dest: 'dist/js/'
  },
  images: {
    src: 'src/img/**',
    dest: 'dist/img/'
  }
}

// Очистити каталог dist, видалити все, крім зображень
function clean() {
  return del(['dist/*', '!dist/img'])
}

// Обробка html и pug
function html() {
  return gulp.src(paths.html.src)
  //.pipe(gulppug())
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(size({
    showFiles:true
  }))
  .pipe(gulp.dest(paths.html.dest))
  .pipe(browsersync.stream())
}

// Обробка препроцесорів стилів
function styles() {
  return gulp.src(paths.styles.src)
  .pipe(sourcemaps.init())
  //.pipe(less())
  //.pipe(stylus())
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer({
    cascade: false
  }))
  .pipe(cleanCSS({
    level: 2
  }))
  .pipe(rename({
    basename: 'style',
    suffix: '.min'
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(size({
    showFiles:true
  }))
  .pipe(gulp.dest(paths.styles.dest))
  .pipe(browsersync.stream())
}

// Обробка Javascript, Typescript та Coffeescript
function scripts() {
  return gulp.src(paths.scripts.src)
  .pipe(sourcemaps.init())
  //.pipe(coffee({bare: true}))
  /*
  .pipe(ts({
    noImplicitAny: true,
    outFile: 'main.min.js'
  }))
  */
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(uglify())
  .pipe(concat('main.min.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(size({
    showFiles:true
  }))
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(browsersync.stream())
}

// Стиснення зображень
function img() {
  return gulp.src(paths.images.src)
  .pipe(newer(paths.images.dest))
  .pipe(imagemin({
    progressive: true
  }))
  .pipe(size({
    showFiles:true
  }))
  .pipe(gulp.dest(paths.images.dest))
}

// Відстеження змін у файлах та запуск лайв сервера
function watch() {
  browsersync.init({
    server: {
        baseDir: "./dist"
    }
  })
  gulp.watch(paths.html.dest).on('change', browsersync.reload)
  gulp.watch(paths.html.src, html)
  gulp.watch(paths.styles.src, styles)
  gulp.watch(paths.scripts.src, scripts)
  gulp.watch(paths.images.src, img)
}

// Таски для ручного запуску за допомогою gulp clean, gulp html і т.д.
exports.clean = clean

exports.html = html
exports.styles = styles
exports.scripts = scripts
exports.img = img
exports.watch = watch

// Таск, який виконується за командою gulp
exports.default = gulp.series(clean, html, gulp.parallel(styles, scripts, img), watch)