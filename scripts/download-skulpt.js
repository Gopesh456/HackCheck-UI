const https = require('https');
const fs = require('fs');
const path = require('path');

const skulptDir = path.join(__dirname, '..', 'public', 'skulpt');

// Ensure the skulpt directory exists
if (!fs.existsSync(skulptDir)) {
  fs.mkdirSync(skulptDir, { recursive: true });
}

const downloadFile = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(skulptDir, filename);
    const file = fs.createWriteStream(filePath);
    
    console.log(`Downloading ${filename}...`);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${filename}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

async function downloadSkulptFiles() {
  try {
    await downloadFile('https://skulpt.org/js/skulpt.min.js', 'skulpt.min.js');
    await downloadFile('https://skulpt.org/js/skulpt-stdlib.js', 'skulpt-stdlib.js');
    console.log('\n✓ All Skulpt files downloaded successfully!');
    console.log('The application will now work offline.');
  } catch (error) {
    console.error('Error downloading Skulpt files:', error.message);
    console.log('\nFallback: The application will use CDN when local files are not available.');
  }
}

downloadSkulptFiles();
