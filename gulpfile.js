var gulp = require('gulp'),
  connect = require('gulp-connect');

function connectFunc() {
    return connect.server();
}

gulp.task('default', connectFunc);
