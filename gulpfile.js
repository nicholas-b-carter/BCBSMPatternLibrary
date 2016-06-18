var gulp            = require('gulp');
var browserSync     = require('browser-sync');
var sass            = require('gulp-ruby-sass');
var prefix          = require('gulp-autoprefixer');
var sourcemaps      = require('gulp-sourcemaps');
var cp              = require('child_process');
var bower           = require('gulp-bower');
var notify          = require('gulp-notify');
var concat          = require('gulp-concat');
var del             = require('del');
var rename          = require('gulp-rename');
var zip             = require('gulp-zip');
var imageMin        = require('gulp-imagemin');
var runSequence     = require('run-sequence');




var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

// Configurable paths
var config = {
    sassPath: './bcbsm/sass',
    bowerDir: './bower_components',
    patternLibPath: './front',
    fontsPath: './_site/fonts',
    tmp: './.tmp',
    assets: './generated',
    downloads: './downloads'
};

var sassConfig = {
    bcbsmSassOptions: {
        includePaths: [config.sassPath, config.bowerDir],
        outputStyle: 'compressed',
        onError: browserSync.notify
    },
    patternLibSassOptions: {
        includePaths: [config.patternLibPath, config.sassPath, config.bowerDir],
        outputStyle: 'compressed',
        onError: browserSync.notify
    },
    appDemoSassOptions: {
        includePaths: [config.patternLibPath, config.sassPath, config.bowerDir],
        outputStyle: 'compressed',
        onError: browserSync.notify
    }
};

/**
 * Install Bower Dependencies
 */
gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(config.bowerDir))
});

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['jekyll-build'], function() {
    console.log('Node version: ' + process.version);
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile both BCBSM styles & Pattern Library specific styles
 */
gulp.task('sass', ['bcbsm-sass', 'pattern-lib-sass'], function () {
    browserSync.reload();
});

/**
 * Compile files from _scss into both _site/bcbsm/styles (for live injecting) and site (for future jekyll builds)
 */
gulp.task('bcbsm-sass', function () {
    return sass(config.sassPath + '/bcbsm.scss', {sourcemap: true, style: 'compact'})
        .pipe(prefix('last 15 versions', '> 1%', 'ie 8', 'ie 7'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.assets + '/styles'))
        .pipe(gulp.dest('./_site/generated/styles'))
        .pipe(browserSync.reload({stream:true}))

});

/**
 * Compile files from front into both _site/pattern-lib/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('pattern-lib-sass', function () {
    return sass([ config.sassPath + '/bcbsm.scss', config.patternLibPath + '/styles/pattern-library.scss'], {sourcemap: true, style: 'compact'})
        .pipe(prefix('last 15 versions', '> 1%', 'ie 8', 'ie 7'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.assets + '/styles'))
        .pipe(gulp.dest('./_site/generated/styles'))
        .pipe(browserSync.reload({stream:true}))

});


gulp.task('app-demo-sass', function () {
    return sass(config.patternLibPath + '/styles/appDemo/appDemo.scss', {sourcemap: true, style: 'compact'})
        .pipe(prefix('last 15 versions', '> 1%', 'ie 8', 'ie 7'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.assets + '/styles'))
        .pipe(gulp.dest('./_site/generated/styles'))
        .pipe(browserSync.reload({stream:true}))

});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch(config.sassPath + '/**/*.scss', ['bcbsm-sass']);
    gulp.watch(config.patternLibPath + '/**/*.scss', ['pattern-lib-sass']);
    gulp.watch(['*.html', '_layouts/*.html', '_includes/*'], ['jekyll-rebuild']);
    gulp.watch(config.patternLibPath + '/scripts/**/*.js', ['copy'])
   // gulp.watch(['_site/generated/**/*.*'], [browserSync.reload]);

});

/**
 * Bundle JS/CSS
 */
gulp.task('copy', ['copy:vendorjs', 'copy:pluginsjs', 'copy:mainjs', 'copy:appdemojs', 'copy:htmlshiv', 'copy:images', 'copy:favicon', 'copy:patternLibStyles', 'copy:bcbsmStyles', 'copy:vendorcss', 'copy:maincss', 'copy:fonts'])

gulp.task('copy:fonts', function() {
    return gulp.src(config.bowerDir + '/font-awesome/fonts/**.*')
        .pipe(gulp.dest(config.fontsPath));
});

gulp.task('copy:pluginsjs', function () {
    return gulp.src(config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap.js')
        .pipe(concat('/scripts/plugins.js'))
        .pipe(gulp.dest(config.assets));
});

gulp.task('copy:vendorjs', function () {
    return gulp.src([config.bowerDir + '/jquery/dist/jquery.js',
        config.bowerDir + '/jquery.inputmask/dist/inputmask/jquery.inputmask.js',
        config.bowerDir + '/jquery.inputmask/dist/inputmask/jquery.inputmask.extensions.js',
        config.bowerDir + '/jquery.inputmask/dist/inputmask/jquery.inputmask.date.extensions.js',
        config.bowerDir + '/jquery.inputmask/dist/inputmask/jquery.inputmask.numeric.extensions.js',
        config.bowerDir + '/jquery.inputmask/dist/inputmask/jquery.inputmask.phone.extensions.js',
        config.bowerDir + '/jquery.inputmask/dist/inputmask/jquery.inputmask.regex.extensions.js',
        config.bowerDir + '/select2/select2.js',
        config.bowerDir + '/nouislider/distribute/jquery.nouislider.all.min.js',
//        config.bowerDir + '/bootstrap-timepicker/js/bootstrap-timepicker.js',
        config.patternLibPath + '/vendor/jquery-ui-1.11.1.custom/jquery-ui.js'])
        .pipe(concat('/scripts/vendor.js'))
        .pipe(gulp.dest(config.assets));
});

gulp.task('copy:mainjs', function () {
    return gulp.src(config.patternLibPath + '/scripts/main.js')
        .pipe(concat('/scripts/main.js'))
        .pipe(gulp.dest(config.assets));
});

gulp.task('copy:appdemojs', function () {
    return gulp.src(config.patternLibPath + '/scripts/appDemo.js')
        .pipe(concat('/scripts/appDemo.js'))
        .pipe(gulp.dest(config.assets));
});

gulp.task('copy:htmlshiv', function () {
     return gulp.src([config.patternLibPath + '/vendor/html5shiv/html5shiv.min.js', config.patternLibPath + '/vendor/matchMedia/matchMedia.js'])
         .pipe(concat('/scripts/vendor.js'))
         .pipe(gulp.dest(config.assets));
});

gulp.task('copy:images', function () {
    return gulp.src(['./front/images/**/*', './bcbsm/images/**/*'])
        .pipe(gulp.dest(config.assets + '/images'));
});

gulp.task('copy:favicon', function () {
    return gulp.src(config.patternLibPath + '/favicon.ico')
        .pipe(concat('/favicon.ico'))
        .pipe(gulp.dest(config.assets));
});

gulp.task('copy:patternLibStyles', function () {
    return gulp.src(config.patternLibPath + '/styles')
        .pipe(gulp.dest(config.downloads));
});

gulp.task('copy:appDemoStyles', function () {
    return gulp.src(config.patternLibPath + '/styles/appDemo')
        .pipe(gulp.dest(config.downloads));
});

gulp.task('copy:bcbsmStyles', function () {
    return gulp.src(config.sassPath)
        .pipe(gulp.dest(config.downloads));
});

gulp.task('copy:vendorcss', function () {
    return gulp.src([
            config.patternLibPath + '/vendor/jquery-ui-1.11.1.custom/jquery-ui.structure.css',
            config.bowerDir + '/font-awesome/css/font-awesome.css',
            config.bowerDir + '/select2/select2.css',
            config.bowerDir + '/nouislider/distribute/jquery.nouislider.min.css',
            config.bowerDir + '/nouislider/distribute/jquery.nouislider.pips.min.css'
        ])
        .pipe(concat('/styles/vendor.css'))
        .pipe(gulp.dest(config.assets));
});


gulp.task('copy:maincss', function () {
    return gulp.src([config.assets + '/styles/pattern-library.css', ])
        .pipe(concat('/styles/main.css'))
        .pipe(gulp.dest(config.assets));
});

gulp.task('zip', function () {
    return gulp.src(config.downloads)
        .pipe(zip('bcbsm.zip'))
        .pipe(gulp.dest(config.downloads));
});

gulp.task('imagemin', function () {
    gulp.src(config.patternLibPath + '/images')
        .pipe(imageMin())
        .pipe(gulp.dest(config.assets))
});

/**
 * Clean task
 */
gulp.task('clean', function() {
    return del([
        '_site/**/*',
        config.tmp + '/**/*',
        config.assets + '/**/*',
        config.downloads + '/**/*'
        ]);
});

gulp.task('builder', function () {
    runSequence('clean','sass', 'imagemin', 'copy', 'zip', 'browser-sync', 'watch');
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['builder']);
