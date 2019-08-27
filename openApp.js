const spawn = require('child_process').spawn
const os = require('os')
const path = require('path')

module.exports = (pluginContext) => {
  return (app, env = {}) => {
    return new Promise((resolve, reject) => {
      if (process.platform === 'win32' || process.platform === 'darwin') {
        return resolve(app)
      }

      // Use absolute paths at all time
      app = app.replace(/^~/, os.homedir())
      // use dex to start the .desktop file
      var p = spawn('dex', [app], {
        cwd: os.homedir(),
      })
      p.stderr.on('data', (data) => {
        console.error('err (' + path.basename(app) + '): ' + data)
      })

      reject() // break chain
    })
  }
}
