const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')

let mainWindow
let updateChecking = false

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

async function setupAutoUpdater() {
  if (!app.isPackaged) {
    return
  }

  if (updateChecking) {
    return
  }

  updateChecking = true

  // لن يبدأ التحميل تلقائيًا قبل موافقة المستخدم
  autoUpdater.autoDownload = false

  // يثبت التحديث عند إغلاق التطبيق
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    console.log('جاري البحث عن تحديث...')
  })

  autoUpdater.on('update-available', async (info) => {
    console.log(`تحديث جديد متوفر: ${info.version}`)

    const result = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'تحديث جديد لنظام الكاشير',
      message: `يوجد تحديث جديد لنظام الكاشير: ${info.version}`,
      detail:
        'سيتم تحميل التحديث الآن. يمكنك الاستمرار في العمل أثناء التحميل.',
      buttons: ['تحميل التحديث', 'لاحقًا'],
      defaultId: 0,
      cancelId: 1,
    })

    if (result.response === 0) {
      try {
        console.log('بدء تحميل التحديث...')
        await autoUpdater.downloadUpdate()
      } catch (error) {
        console.error('فشل تحميل التحديث:', error)

        await dialog.showMessageBox(mainWindow, {
          type: 'error',
          title: 'تعذر تحديث نظام الكاشير',
          message: 'حدث خطأ أثناء تحميل التحديث.',
          detail: String(error),
        })
      }
    }
  })

  autoUpdater.on('update-not-available', () => {
    console.log('نظام الكاشير محدث بالفعل.')
  })

  autoUpdater.on('download-progress', (progress) => {
    const percent = Math.round(progress.percent)

    console.log(`تحميل التحديث: ${percent}%`)

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitle(`نظام الكاشير - جاري تحديث النظام ${percent}%`)
    }
  })

  autoUpdater.on('update-downloaded', async (info) => {
    console.log(`تم تحميل التحديث: ${info.version}`)

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitle('نظام الكاشير')
    }

    const result = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'التحديث جاهز',
      message: `تم تحميل التحديث ${info.version} بنجاح.`,
      detail:
        'يجب إعادة تشغيل نظام الكاشير لتثبيت التحديث الجديد.',
      buttons: ['تحديث الآن', 'لاحقًا'],
      defaultId: 0,
      cancelId: 1,
    })

    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true)
    }
  })

  autoUpdater.on('error', async (error) => {
    console.error('خطأ في التحديث:', error)

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitle('نظام الكاشير')

      await dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'تحديث نظام الكاشير',
        message: 'تعذر التحقق من وجود تحديث أو تحميله.',
        detail: String(error),
        buttons: ['إغلاق'],
      })
    }
  })

  // ننتظر قليلًا حتى تفتح واجهة الكاشير قبل الفحص
  setTimeout(async () => {
    try {
      await autoUpdater.checkForUpdates()
    } catch (error) {
      console.error('تعذر فحص التحديثات:', error)
    }
  }, 3000)
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