const { app, BrowserWindow, Tray, nativeImage, ipcMain } = require('electron');
const sharp = require('sharp');
let tray = null;

const SVG_TEMPLATE = `<svg width="600" height="56">
  <style>
    <![CDATA[      
      @font-face {
        font-family: 'Poppins';
        src: url('');
      }
    ]]>
  </style>
  <text x="0" y="42" font-size="50" fill="white" font-family="Poppins">{{TEXT}}</text>
</svg>`;

async function createTrayIconWithText(text) {
    const outputBuffer = await sharp(Buffer.from(SVG_TEMPLATE.replace('{{TEXT}}', text)))
        .resize(150, 12)
        .toBuffer();
    return outputBuffer;
}

function createWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 400,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.loadFile('index.html');
    // win.on('minimize', event => {
    //     event.preventDefault();
    //     win.webContents.send('window-minimized');
    //     win.hide();
    // });
    win.on('minimize', event => {
        if (['linux', 'darwin'].includes(process.platform)) {
            event.preventDefault();
            win.webContents.send('window-minimized');
            win.hide();
        }
    });
    
    win.on('restore', () => {
        win.webContents.send('window-restored');
        tray?.destroy();
        tray = null;
    });
}

ipcMain.on('timer-value', async (_, timerValue) => {
    const customIcon = await createTrayIconWithText(timerValue);
    tray?.destroy();
    tray = new Tray(nativeImage.createFromBuffer(customIcon));
    tray.on('click', () => {
        BrowserWindow.getAllWindows()[0]?.show();
        tray.destroy();
        tray = null;
    });
});

app.whenReady().then(createWindow);
