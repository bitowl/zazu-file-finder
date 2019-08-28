const fs = require('fs')
const os = require('os')
const path = require('path')
const readline = require('readline')
const icons = require('linux-icons')
const HOME_REGEX = new RegExp('^' + os.homedir())
const {
  execSync,
} = require('child_process')

class File {
  constructor(filePath, name) {
    this.path = filePath
    this.name = name || this.getName()
    this.stats = null
    this.applicationIcon = null
  }

  getName() {
    if (os.platform().match(/(darwin|win32)/) && this.isApp()) {
      //  strip file extension
      return path.parse(this.path).name
    } else {
      return path.basename(this.path)
    }
  }

  getStats() {
    return new Promise((resolve, reject) => {
      fs.stat(this.path, (err, stats) => {
        if (!err) this.stats = stats
        if (this.isApp()) {
          const rl = readline.createInterface({
            input: fs.createReadStream(this.path)
          })
          rl.on('line', (line) => {
            const parts = line.split('=')
            if (parts.length === 2) {
              // interesting key=value line
              if (parts[0] === 'Name') {
                this.name = parts[1]
              } else if (parts[0] === 'Icon') {
                this.applicationIcon = parts[1]
              }
            }
          })
          rl.on('close', () => {
            resolve()
          })


        } else {
          resolve()
        }
      })
    })
  }

  isViewable(exclude) {
    const isHidden = this.path.match(/\/\.[^/]+$/)
    const isExcluded = exclude.indexOf(this.path) !== -1
    return !isHidden && !isExcluded
  }

  isApp() {
    switch (os.platform()) {
      case 'darwin':
        return !!this.path.match(/\.(prefPane|app)$/)
      case 'win32':
        return !!this.path.match(/\.(lnk|appref-ms|exe)$/)
      default:
        //  Check whether its executable file.
        /*if (this.stats && this.stats.mode) {
          return !!(this.stats.mode & 0b001001001)
        }*/
        return this.path.endsWith('.desktop')
    }
    return false
  }

  isDirectory() {
    const isDirectory = this.stats.isDirectory()
    const isSymbolicLink = this.stats.isSymbolicLink()
    const isMacApp = os.platform() === 'darwin' && this.isApp()
    return isDirectory && !isSymbolicLink && !isMacApp
  }

  isBroken() {
    return !this.stats
  }

  relativePath() {
    return this.path.replace(HOME_REGEX, '~')
  }

  icon() {
    if (this.applicationIcon !== null) {
      const icon = execSync('python3 ' + __dirname + '/lookup_icon.py ' + this.applicationIcon).toString();
      return icon;
    }
    return this.isDirectory() ? 'fa-folder' : 'fa-file'
  }

  toJson() {
    if (this.isApp()) {
      return {
        id: this.relativePath(),
        icon: this.icon(),
        title: this.name,
        subtitle: this.relativePath(),
        value: this.relativePath(),
      }
    } else {
      return {
        id: this.relativePath(),
        icon: this.icon(),
        title: this.name,
        subtitle: this.relativePath(),
        value: this.relativePath(),
      }
    }
  }
}

module.exports = File
