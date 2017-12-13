const electron = require('electron')
const {app, BrowserWindow, Menu} = electron
const path = require('path')
const url = require('url')

// шаблон меню
menuTemplate = [
  {
    label: 'О программе',
    click: () => {
      openAboutWindow()
    }
  }
]

// отвечает за главное окно приложение
let mainWindow

// создание основного окна приложения
function createWindow() {
  mainWindow = new BrowserWindow({
    center: true,
    icon: path.join(__dirname, '/files/GoogleMaps.ico')
  })    // создание окна приложения 

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))   // загружает index.html как шаблон для главной страницы приложения

  var menu = Menu.buildFromTemplate(menuTemplate)   // создаёт шаблон меню
  mainWindow.setMenu(menu)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.setMinimumSize(580, 400);              // задаёт минимальный размер 
}

// создаёт окно "О программе" 
function openAboutWindow() {

  let aboutWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    icon: path.join(__dirname, '/files/GoogleMaps.ico')
  })    // создание окно "О программе"

  aboutWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/particles/about.html'),
    protocol: 'file:',
    slashes: true
  }))   // загружает about.html как шаблон

  aboutWindow.setMenu(null)                         // окно без меню

  aboutWindow.once('ready-to-show', () => {
    aboutWindow.maximize()
    aboutWindow.show()
  })    // вывод окна по готовности
}

// работа с самим приложением, события приложения  
app.on('ready', () => {
  createWindow()
  mainWindow.maximize()
  mainWindow.show()
  electron.powerMonitor.on('on-ac', () => {
    mainWindow.restore()
  })
  electron.powerMonitor.on('on-battery', () => {
    mainWindow.minimize()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
