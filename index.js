const { app, BrowserWindow, Tray, nativeImage, ipcMain } = require('electron');
let tray = null;
const sharp = require('sharp');
const fs = require('fs');

async function createTrayIconWithText(text) {
  const fontSize = 56; // Increase the font size for high-res SVG
  const fontColor = 'white';
  const xOffset = 0; 
  const yOffset = 42; // Adjust offset for high-res SVG

  // const svg = `<svg width="600" height="56">
  //   <text x="${xOffset}" y="${yOffset}" font-size="${fontSize}" fill="${fontColor}">${text}</text>
  // </svg>`;
  const svg = `<svg width="600" height="56">
  <style>
    <![CDATA[      
      @font-face {
        font-family: 'MyFont';
        src: url('path_to_my_font.ttf');
      }
    ]]>
  </style>
  <text x="${xOffset}" y="${yOffset}" font-size="${fontSize}" fill="${fontColor}" font-family="MyFont">${text}</text>
</svg>`;

  const outputBuffer = await sharp(Buffer.from(svg))
    .resize(150, 14) // Scale down to the size you need
    .toBuffer();

  return outputBuffer;
}


// async function createTrayIconWithText(text) {
//   const fontSize = 14;  // Adjust font size
//   const fontColor = 'white';
//   const xOffset = 0;  // Adjust offsets
//   const yOffset = 12;  // Adjust offsets

//   const svg = `<svg width="150" height="14">
//     <text x="${xOffset}" y="${yOffset}" font-size="${fontSize}" fill="${fontColor}">${text}</text>
//   </svg>`;

//   const outputBuffer = await sharp(Buffer.from(svg))
//     .toBuffer();

//   return outputBuffer;
// }


// async function createTrayIconWithText(text) {
//   const baseImage = await sharp('icon.png').resize(16, 16).toBuffer();
//   const fontSize = 40; // Increase font size
//   const fontColor = 'white';
//   const xOffset = 80; // Adjust offset
//   const yOffset = 50; // Adjust offset

//   const svg = `<svg width="600" height="64"> // Increase SVG size
//     <image href="data:image/png;base64,${baseImage.toString('base64')}" width="64" height="64" />
//     <text x="${xOffset}" y="${yOffset}" font-size="${fontSize}" fill="${fontColor}">${text}</text>
//   </svg>`;

//   // Render SVG at high resolution, then scale down to 150x16
//   const outputBuffer = await sharp(Buffer.from(svg))
//     .resize(150, 16)
//     .toBuffer();

//   return outputBuffer;
// }

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');

  win.on('minimize', function(event) {
    event.preventDefault();
    win.webContents.send('window-minimized');
    win.hide();
  });
  
  win.on('restore', function(event) {
    win.webContents.send('window-restored');
    if (tray !== null) {
      tray.destroy();
      tray = null;
    }
  });
  
}

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
