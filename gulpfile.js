const gulp = require('gulp')
const path = require('path')
const sass = require('gulp-sass')
const uglify = require('gulp-uglify-es').default
const ts = require('gulp-typescript')

// @ts-ignore
sass.compiler = require('node-sass')

const isProd = process.argv.includes('--production')

gulp.task('sass', gulp.series(() => {
  const build = gulp.src(path.join(__dirname, 'resources/assets/styles', '**/*.{scss,sass}'))

  if (isProd) build.pipe(sass({ outputStyle: 'compressed' }))
  else build.pipe(sass({ outputStyle: 'expanded' }))

  return build.on('error', sass.logError)
    .pipe(gulp.dest(path.join(__dirname, 'public/css')))
}))

gulp.task('javascript', gulp.series(() => {
  const build = gulp.src(path.join(__dirname, 'resources/assets/javascript', '**/*.js'))
  isProd && build.pipe(uglify())
  return build.pipe(gulp.dest(path.join(__dirname, 'public/js')))
}))

gulp.task('typescript', gulp.series(() => {
  const tsProject = ts.createProject(path.join(__dirname, 'resources/assets/typescript/tsconfig.json'))
  const tsResult = tsProject.src().pipe(tsProject())

  const build = tsResult.js
  isProd && build.pipe(uglify())
  return build.pipe(gulp.dest(path.join(__dirname, 'public/js')))
}))

gulp.task('build:watch', gulp.series([() => {
  gulp.watch(path.join(__dirname, 'resources/assets/styles', '**/*.{sass,scss}'), gulp.series('sass'))
  gulp.watch(path.join(__dirname, 'resources/assets/javascript', '**/*.js'), gulp.series('javascript'))
  gulp.watch(path.join(__dirname, 'resources/assets/typescript', '**/*.ts'), gulp.series('typescript'))
}]))

gulp.task('build', gulp.series(['sass', 'javascript', 'typescript']))