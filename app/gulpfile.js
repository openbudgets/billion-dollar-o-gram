var gulp = require('gulp');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'browser-sync']
});

gulp.task('browser-sync', function() {
    $.browserSync({
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('deploy', function() {
  return gulp.src("**/*").pipe($.ghPages({
    remoteUrl: "git@github.com:jplusplus/tmf-moneytrail.git"
  }));
});

gulp.task('default', ['browser-sync']);
