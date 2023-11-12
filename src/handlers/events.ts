import fs from "fs"
import path from "path"

type Event = {
  eventName: string
  executer: (...args: any[]) => Promise<any>
}

export const events: Event[] = []

const initialPath = fs.existsSync(path.join(__dirname, '..', 'events')) ? path.join(__dirname, '..', 'events') : path.join(__dirname, 'events')

readFolder(initialPath)

function readFolder(dirPath: string) {
  const files = fs.readdirSync(dirPath)

  for (const file of files) {
    readFile(path.join(dirPath, file))
  }
}

function readFile(filePath: string) {
  const file = fs.lstatSync(filePath)

  if (file.isFile()) {
    events.push(require(filePath))
  }

  if (file.isDirectory()) {
    readFolder(filePath)
  }
}