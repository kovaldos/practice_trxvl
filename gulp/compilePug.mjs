import gulp from 'gulp';
import pug from 'gulp-pug';
import plumber from 'gulp-plumber';

const compilePug = (data) => {
  return gulp
      .src('source/pug/pages/*.pug')
      .pipe(plumber())
      .pipe(
          pug({
            pretty: true,
            locals: data, // Передаём данные в Pug
          })
      )
      .pipe(gulp.dest('build'));
};

export default compilePug;
