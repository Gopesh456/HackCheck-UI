const fs = require("fs");
const https = require("https");
const path = require("path");

const files = [
  {
    url: "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js",
    destination: path.join(__dirname, "skulpt.min.js"),
  },
  {
    url: "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js",
    destination: path.join(__dirname, "skulpt-stdlib.js"),
  },
];

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    https
      .get(url, (response) => {
        response.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log(`Downloaded ${url} to ${destination}`);
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(destination);
        console.error(`Error downloading ${url}:`, err.message);
        reject(err);
      });
  });
}

async function downloadAllFiles() {
  try {
    for (const file of files) {
      await downloadFile(file.url, file.destination);
    }
    console.log("All files downloaded successfully!");
  } catch (error) {
    console.error("Error downloading files:", error);
  }
}

downloadAllFiles();
