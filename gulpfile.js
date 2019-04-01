const path = require('path')
const gulp = require('gulp')
const ts = require('gulp-typescript')
const sourcemaps = require('gulp-sourcemaps')
const rimraf = require('rimraf')

const projects = {
  red5: './core',
  router: './router',
  server: './server',
  storage: './storage',
  session: './session',
  template: './template',
  middleware: './middleware',
  // Optional dependencies
  mysql: './mysql'
}

const tasks = [
  'router', 'middleware', 'template', 'storage', 'session', 'server',
  // Optional dependencies
  'mysql'
]

/**
 * Builds the project
 * @param {string} projectRoot
 * @returns {Promise<boolean>}
 */
function makeProject(projectRoot) {
  return new Promise(resolve => {
    rimraf(path.join(projectRoot, 'types'), (err) => {
      if (err) {
        console.error(err.message)
        return resolve(false)
      }
      let tsProject = ts.createProject(path.join(projectRoot, 'tsconfig.json'))
      let tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
      tsResult.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.join(projectRoot, 'lib')).on('end', () => {
          tsResult.dts.pipe(gulp.dest(path.join(projectRoot, 'types'))).on('end', () => resolve(true))
          // gulp.src(path.join(projectRoot,'src/**/*.ts')).pipe(sourcemaps.init())
        })).on('end', () => resolve(true))
    })
  })
}

/**
 * @param {string} projectRoot
 * @returns {Promise<boolean>}
 */
// function deleteTypes(projectRoot) {
//   return new Promise(resolve => {
//     try {
//       rimraf.sync(path.join(projectRoot, 'types'))
//       resolve(true)
//     } catch (e) {
//       resolve(false)
//     }
//   })
// }

gulp.task('router', () => makeProject(path.join(__dirname, projects.router)))
gulp.task('server', () => makeProject(path.join(__dirname, projects.server)))
gulp.task('storage', () => makeProject(path.join(__dirname, projects.storage)))
gulp.task('session', () => makeProject(path.join(__dirname, projects.session)))
gulp.task('template', () => makeProject(path.join(__dirname, projects.template)))
gulp.task('middleware', () => makeProject(path.join(__dirname, projects.middleware)))
// Optional dependencies
gulp.task('mysql', () => makeProject(path.join(__dirname, projects.mysql)))

gulp.task('build:watch', gulp.series([...tasks, () => {
  gulp.watch('./router/src/**', gulp.series('router'))
  gulp.watch('./server/src/**', gulp.series('server'))
  gulp.watch('./storage/src/**', gulp.series('storage'))
  gulp.watch('./session/src/**', gulp.series('session'))
  gulp.watch('./template/src/**', gulp.series('template'))
  gulp.watch('./middleware/src/**', gulp.series('middleware'))
  // Optional dependencies
  gulp.watch('./mysql/src/**', gulp.series('mysql'))
}]))

gulp.task('build', gulp.series(...tasks))