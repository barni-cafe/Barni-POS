const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 750,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#f5efe8',

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(
      path.join(__dirname, 'dist', 'index.html')
    )
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })
}

function setupAutoUpdater() {
  if (!app.isPackaged) {
    return
  }

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    console.log('جاري البحث عن تحديث...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log(`تحديث جديد متوفر: ${info.version}`)
  })

  autoUpdater.on('update-not-available', () => {
    console.log('Barni-POS محدث بالفعل.')
  })

  autoUpdater.on('download-progress', (progress) => {
    console.log(
      `تحميل التحديث: ${Math.round(progress.percent)}%`
    )
  })

  autoUpdater.on('update-downloaded', async () => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'تحديث جديد',
      message: 'تم تحميل تحديث جديد لـ Barni-POS.',
      detail: 'سيتم تثبيت التحديث وإعادة تشغيل التطبيق الآن.',
      buttons: ['تحديث الآن', 'لاحقًا'],
      defaultId: 0,
      cancelId: 1,
    })

    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  })

  autoUpdater.on('error', (error) => {
    console.error('خطأ في التحديث:', error)
  })

  autoUpdater.checkForUpdates()
}

app.whenReady().then(() => {
  createWindow()
  setupAutoUpdater()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})