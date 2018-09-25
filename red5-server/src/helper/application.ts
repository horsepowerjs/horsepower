import * as path from 'path'

/**
 * Get the path to the storage folder
 *
 * @export
 * @param {string} [childPath=''] A child folder or file
 * @returns
 */
export function storagePath(childPath: string = '') {
  return path.join(applicationRoot(), 'storage', childPath)
}

/**
 * Get the path to the resources folder
 *
 * @export
 * @param {string} [childPath=''] A child folder or file
 * @returns
 */
export function resourcePath(childPath: string = '') {
  return path.join(applicationRoot(), 'resources', childPath)
}

/**
 * Get the path to the server
 *
 * @export
 * @param {string} [childPath=''] A child folder or file
 * @returns
 */
export function applicationPath(childPath: string = '') {
  return path.join(applicationRoot(), childPath)
}

/**
 * Get the path to the config folder
 *
 * @export
 * @param {string} [childPath=''] A child folder or file
 * @returns
 */
export function configPath(childPath: string = '') {
  return path.join(applicationRoot(), 'config', childPath)
}

/**
 * Get the path to the app folder
 *
 * @export
 * @param {string} [childPath=''] A child folder or file
 * @returns
 */
export function appPath(childPath: string = '') {
  return path.join(applicationRoot(), 'app', childPath)
}

/**
 * get an environment setting from the ".env" file
 *
 * @export
 * @param {string} key The key from the environment file
 * @param {string} [fallback=''] A fallback if the environment key is not found
 * @returns
 */
export function env(key: string, fallback: string = '') {
  if (process.env[key]) return process.env[key]
  return fallback
}

/**
 * The application root path
 *
 * @returns
 */
function applicationRoot() {
  let root = __dirname
  // If there is a main file
  if (require.main && require.main.filename) root = path.dirname(require.main.filename)
  // If there is a pm2 exec path
  else if (process.env.pm_exec_path) root = path.dirname(process.env.pm_exec_path)
  return root
}