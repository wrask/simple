const gulp        	= require('gulp');
const browserSync 	= require('browser-sync').create(); //автоматическое обновление браузера
const rsync         = require('gulp-rsync'); //деплой файлов на сервер
const concat        = require('gulp-concat'); //объединение фйлов
const uglify        = require('gulp-uglify'); //сжатие js-кода
const sass        	= require('gulp-sass'); //sass
const cleanCSS      = require('gulp-clean-css'); //сжатие css-кода
const rename        = require('gulp-rename'); //переименование файлов
const autoprefixer  = require('gulp-autoprefixer'); //автоматическое добавление префиксов
const cache         = require('gulp-cache'); //кэширование
const notify        = require("gulp-notify"); //системные уведомления об ошибках



gulp.task('js', function() {
	return gulp.src([
		'src/js/jquery.min.js',
		'src/js/slick.min.js',
		'src/js/common.js',
		])
	//объединение и сжатие .js файлов выше в файл common.min.js 
	.pipe(concat('common.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('src/js'))
	.pipe(browserSync.reload({stream: true}));
	});

// компилируем Sass
gulp.task('sass', function() {
	return gulp.src(['src/sass/*.sass'])
	//вывод ошибок при компиляции Sass
	.pipe(sass({outputStyle: 'expand'}).on("error", notify.onError()))
	//переименование main.css в main.min.css
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(autoprefixer(['last 15 versions']))
	//сжатие файла main.min.css
	.pipe(cleanCSS())
	.pipe(gulp.dest("src/css"))
	.pipe(browserSync.stream());
	});

// Watch Sass & Serve
gulp.task('serve', ['sass','js'], function() {
	browserSync.init({
		server: "./src"  
		});
	gulp.watch(['src/sass/*.sass'], ['sass']);
	gulp.watch(['src/js/common.js'], ['js']);
	gulp.watch("src/*.html").on('change', browserSync.reload);
	});

//деплой файлов на сервер
gulp.task('deploy', function() {
	return gulp.src('src/**')
	.pipe(rsync({
		root: 'src/',
		hostname: 'wrask@whiplash.tk',
		destination: '/usr/local/www/nginx-dist/romandunik.tk/',
		// файлы, включённые в деплой
		include: ['index.html', 'css/main.min.css', 'fonts/*', 'img/*', 'js/common.min.js'], 
		exclude: ['sass/**', 'libs/**', 'js/common.js', 'js/jquery.min.js', 'js/slick.min.js'], // Excludes files from deploy
		//recursive: true,
		archive: true,
		silent: false,
		compress: true,
		chmod: "ugo=rwx"
	}));
});

//очистка кэша
gulp.task('clearcache', function () { return cache.clearAll(); });

// основной таск
gulp.task('default', ['serve']);