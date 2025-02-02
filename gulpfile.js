import gulp from 'gulp';
import browserSync from 'browser-sync';
import { deleteAsync } from 'del';
import { compileStyles, compileMinStyles } from './gulp/compileStyles.mjs';
import { copy, copyImages, copySvg } from './gulp/copyAssets.mjs';
import compileScripts from './gulp/compileScripts.mjs';
import { optimizeSvg, sprite, createWebp, createAvif, optimizePng, optimizeJpg } from './gulp/optimizeImages.mjs';
import pugCompiler from './gulp/compilePug.mjs';
import fs from 'fs';
import path from 'path';

const server = browserSync.create();
const streamStyles = () => compileStyles().pipe(server.stream());
const clean = () => deleteAsync('build');
const refresh = (done) => {
  server.reload();
  done();
};

// Функция объединения всех JSON-файлов в dataset.json
const mergeData = () => {
  const dataDir = './source/data/partials/';
  const outputFile = './source/data/dataset.json';

  try {
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
    let mergedData = {};

    files.forEach(file => {
      const filePath = path.join(dataDir, file);
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      mergedData = { ...mergedData, ...fileData };
    });

    fs.writeFileSync(outputFile, JSON.stringify(mergedData, null, 2));
    console.log('✅ dataset.json обновлен');
  } catch (error) {
    console.error('❌ Ошибка объединения JSON:', error);
  }
};

// Функция загрузки данных из dataset.json
const loadData = () => {
  mergeData(); // Перед загрузкой обновляем dataset.json
  try {
    return JSON.parse(fs.readFileSync('./source/data/dataset.json', 'utf8'));
  } catch (error) {
    console.error('Ошибка загрузки JSON:', error);
    return {};
  }
};

// Таск Pug теперь получает данные из dataset.json
const pug = () => {
  const data = loadData();
  return pugCompiler(data);
};

const syncServer = () => {
  server.init({
    server: 'build/',
    index: 'sitemap.html',
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  gulp.watch('source/pug/**/*.pug', gulp.series(pug, refresh));
  gulp.watch('source/sass/**/*.{scss,sass}', streamStyles);
  gulp.watch('source/js/**/*.{js,json}', gulp.series(compileScripts, refresh));
  gulp.watch('source/data/partials/*.json', gulp.series(pug, refresh)); // Теперь следим за всеми JSON-файлами
  gulp.watch('source/img/**/*.svg', gulp.series(copySvg, sprite, pug, refresh));
  gulp.watch('source/img/**/*.{png,jpg,webp}', gulp.series(copyImages, pug, refresh));

  gulp.watch('source/favicon/**', gulp.series(copy, refresh));
  gulp.watch('source/video/**', gulp.series(copy, refresh));
  gulp.watch('source/downloads/**', gulp.series(copy, refresh));
  gulp.watch('source/*.php', gulp.series(copy, refresh));
};

const build = gulp.series(clean, copy, sprite, gulp.parallel(compileMinStyles, compileScripts, pug));
const dev = gulp.series(clean, copy, sprite, gulp.parallel(compileMinStyles, compileScripts, pug, optimizePng, optimizeJpg, optimizeSvg), syncServer);
const start = gulp.series(clean, copy, sprite, gulp.parallel(compileStyles, compileScripts, pug), syncServer);
const nomin = gulp.series(clean, copy, sprite, gulp.parallel(compileStyles, compileScripts, pug, optimizePng, optimizeJpg, optimizeSvg));

const optimize = gulp.series(gulp.parallel(optimizePng, optimizeJpg, optimizeSvg));

export { createWebp as webp, createAvif as avif, build, start, dev, nomin, optimize };
