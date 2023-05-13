const { app, BrowserWindow, Tray, nativeImage, ipcMain } = require('electron');
let tray = null;
const sharp = require('sharp');

// Function to create tray timer
async function createTrayIconWithText(text) {
  const fontSize = 50;
  const fontColor = 'white';
  const xOffset = 0;
  const yOffset = 42;
  const svg = `<svg width="600" height="56">
  <style>
    <![CDATA[      
      @font-face {
        font-family: 'Poppins';
        src: url('');
      }
    ]]>
  </style>
  <text x="${xOffset}" y="${yOffset}" font-size="${fontSize}" fill="${fontColor}" font-family="Poppins">${text}</text>
</svg>`;

  const outputBuffer = await sharp(Buffer.from(svg))
    .resize(150, 12)
    .toBuffer();

  return outputBuffer;
}

// Function to create initial window
function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load index.html file here
  win.loadFile('index.html');

  // Window minimize event
  win.on('minimize', function (event) {
    event.preventDefault();
    win.webContents.send('window-minimized');
    win.hide();
  });

  // Window restore event
  win.on('restore', function (event) {
    win.webContents.send('window-restored');
    // If tray exists then destroy
    if (tray !== null && !tray.isDestroyed()) {
      tray.destroy();
      tray = null;
    }
  });


}

// Function to get timer value
ipcMain.on('timer-value', async (event, timerValue) => {
  const customIcon = await createTrayIconWithText(timerValue);
  const customIconImage = nativeImage.createFromBuffer(customIcon);
  if (tray) {
    tray.destroy();
  }
  tray = new Tray(customIconImage);
  tray.on('click', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      win.show();
    }
    tray.destroy();
    tray = null;
  });
});

app.whenReady().then(createWindow);
