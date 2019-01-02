const path = require('path')
const fs = require('fs')
const gulp = require('gulp')
const ts = require('gulp-typescript')
const sourcemaps = require('gulp-sourcemaps')

const projects = {
  red5: './core',
  router: './router',
  server: './server',
  storage: './storage',
  session: './session',
  template: './template',
  middleware: './middleware'
}

function makeProject(projectRoot) {
  var tsProject = ts.createProject(path.join(projectRoot, 'tsconfig.json'))
  let tsResult = tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
  return tsResult.js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.join(projectRoot, 'lib')).on('end', () => {
      tsResult.dts.pipe(gulp.dest(path.join(projectRoot, 'types')))
      // gulp.src(path.join(projectRoot,'src/**/*.ts')).pipe(sourcemaps.init())
    }))
}

// gulp.task('red5', () => makeProject(projects.red5))
gulp.task('router', () => makeProject(projects.router))
gulp.task('server', () => makeProject(projects.server))
gulp.task('storage', () => makeProject(projects.storage))
gulp.task('session', () => makeProject(projects.session))
gulp.task('template', () => makeProject(projects.template))
gulp.task('middleware', () => makeProject(projects.middleware))

gulp.task('build', gulp.series(['router', 'template', 'storage', 'session', 'server', 'middleware', () => {
  gulp.watch('./router/src/**', gulp.series('router'))
  gulp.watch('./server/src/**', gulp.series('server'))
  gulp.watch('./storage/src/**', gulp.series('storage'))
  gulp.watch('./session/src/**', gulp.series('session'))
  gulp.watch('./template/src/**', gulp.series('template'))
  gulp.watch('./middleware/src/**', gulp.series('middleware'))
  // gulp.watch('./red5/src/**', gulp.series('red5'))
}]))