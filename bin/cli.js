#!/usr/bin/env node

const readline = require('readline');
const https = require('https');
const fs = require('fs');

// Banner
console.log(`
===============================
  MINECRAFT INSTALLER
  MADE BY CRAFTINGCRAZEGAMING
===============================\n`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let input = {};

rl.question('Type (e.g., gh): ', (type) => {
  input.type = type.trim();
  rl.question('Version (e.g., 1.20.4): ', (version) => {
    input.version = version.trim();
    rl.question('Build (optional): ', (build) => {
      input.build = build.trim();
      rl.question('Min RAM (e.g., 1G): ', (minRam) => {
        input.minRam = minRam.trim() || "1G";
        rl.question('Max RAM (e.g., 2G): ', (maxRam) => {
          input.maxRam = maxRam.trim() || "2G";
          rl.close();
          install(input);
        });
      });
    });
  });
});

function install({ version, minRam, maxRam }) {
  const fileName = `minecraft_server_${version}.jar`;
  const url = `https://download.getbukkit.org/spigot/spigot-${version}.jar`;

  console.log(`\nDownloading from: ${url}`);

  const file = fs.createWriteStream(fileName);
  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error('Download failed: Invalid version or not found.');
      return;
    }

    res.pipe(file);
    file.on('finish', () => {
      file.close(() => {
        console.log(`\nDownloaded: ${fileName}`);
        console.log(`\nTo run your server:\n`);
        console.log(`java -Xmx${maxRam} -Xms${minRam} -jar ${fileName} nogui\n`);
      });
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });
}
