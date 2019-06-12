const path = require('path')
const gulp = require('gulp')
const ts = require('gulp-typescript')
const sourcemaps = require('gulp-sourcemaps')
const rimraf = require('rimraf')

const projects = {
  router: './router',
  server: './server',
  storage: './storage',
  template: './template',
  // middleware: './middleware',
  // Optional dependencies
  mysql: './mysql',
  session: './plugins/session',
  auth: './plugins/auth',
  sockets: './plugins/sockets'
}

const tasks = [
  'router', 'template', 'storage', 'server',
  // Optional dependencies
  'mysql', 'session', 'auth', 'sockets'
]

/**
 * Builds the project
 * @param {string} projectRoot
 * @returns {Promise<void>}
 */
async function makeProject(projectRoot) {
  let err = await new Promise(resolve => rimraf(path.join(projectRoot, 'types/*'), (err) => resolve(err)))
  if (err) {
    console.error('rimraf:', err.message)
    // return resolve(false)
  }

  let tsResult = await new Promise(async resolve => {
    let tsProject = ts.createProject(path.join(projectRoot, 'tsconfig.json'))
    let tsResult = tsProject.src()
      .pipe(sourcemaps.init())
      .pipe(tsProject())
      .on('finish', () => resolve(tsResult))
  })

  return await new Promise(resolve => {
    tsResult.js
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(path.join(projectRoot, 'lib')).on('end', () => {
        tsResult.dts.pipe(gulp.dest(path.join(projectRoot, 'types'))).on('finish', () => resolve())
        // gulp.src(path.join(projectRoot,'src/**/*.ts')).pipe(sourcemaps.init())
      }))
  })
}

gulp.task('router', () => makeProject(path.join(__dirname, projects.router)))
gulp.task('server', () => makeProject(path.join(__dirname, projects.server)))
gulp.task('storage', () => makeProject(path.join(__dirname, projects.storage)))
gulp.task('template', () => makeProject(path.join(__dirname, projects.template)))
// gulp.task('middleware', () => makeProject(path.join(__dirname, projects.middleware)))
// Optional dependencies
gulp.task('mysql', () => makeProject(path.join(__dirname, projects.mysql)))
gulp.task('session', () => makeProject(path.join(__dirname, projects.session)))
gulp.task('auth', () => makeProject(path.join(__dirname, projects.auth)))
gulp.task('sockets', () => makeProject(path.join(__dirname, projects.sockets)))

gulp.task('build:watch', gulp.series([...tasks, () => {
  gulp.watch('./router/src/**/*.ts', gulp.series('router'))
  gulp.watch('./server/src/**/*.ts', gulp.series('server'))
  gulp.watch('./storage/src/**/*.ts', gulp.series('storage'))
  gulp.watch('./template/src/**/*.ts', gulp.series('template'))
  // gulp.watch('./middleware/src/**/*.ts', gulp.series('middleware'))
  // Optional dependencies
  gulp.watch('./mysql/src/**/*.ts', gulp.series('mysql'))
  gulp.watch('./plugins/session/src/**/*.ts', gulp.series('session'))
  gulp.watch('./plugins/auth/src/**/*.ts', gulp.series('auth'))
  gulp.watch('./plugins/sockets/src/**/*.ts', gulp.series('sockets'))
}]))

gulp.task('build', gulp.series(...tasks))