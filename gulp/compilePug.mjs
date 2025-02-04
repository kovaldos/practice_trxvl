import gulp from 'gulp';
import pug from 'gulp-pug';
import plumber from 'gulp-plumber';
import fs from 'fs';
import path from 'path';

// Загружаем JSON
const loadData = () => {
  const dataPath = path.resolve('source/data/dataset.json');
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (error) {
    console.error(`Ошибка загрузки JSON из ${dataPath}:`, error);
    return {};
  }
};

const compilePug = () => {
  const locals = loadData(); // Загружаем JSON как переменные

  return gulp
      .src('source/pug/pages/*.pug')
      .pipe(plumber())
      .pipe(
          pug({
            pretty: true,
            locals, // Передаём данные в pug
          })
      )
      .pipe(gulp.dest('build'));
};

export default compilePug;
