const fs = require('fs');
const https = require('https');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

const download = (url, dest, cb) => {
  const file = fs.createWriteStream(dest);
  https.get(url, res => {
    if (res.statusCode !== 200) return cb(`Download failed: ${res.statusCode}`);
    res.pipe(file);
    file.on('finish', () => file.close(cb));
  }).on('error', err => fs.unlink(dest, () => cb(err.message)));
};

const createLaunchScript = (minRam, maxRam) => {
  const script = `#!/bin/bash\njava -Xmx${maxram} -Xms${minram} -jar server.jar nogui\n`;
  fs.writeFileSync('start.sh', script);
  fs.chmodSync('start.sh', 0o755);
};

const typeUrls = {
  paper: v => `https://api.papermc.io/v2/projects/paper/versions/${v}/builds`,
  spigot: v => `https://download.getbukkit.org/spigot/spigot-${v}.jar`,
  purpur: v => `https://api.purpurmc.org/v2/purpur/${v}`,
  waterfall: v => `https://api.papermc.io/v2/projects/waterfall/versions/${v}/builds`,
  vanilla: v => `https://piston-data.mojang.com/v1/versions/${v}/downloads/server.jar`,
  fabric: v => `https://meta.fabricmc.net/v2/versions/loader/${v}/`,
  forge: v => `https://files.minecraftforge.net/net/minecraftforge/forge/index_${v}.html`,
  sponge: v => `https://repo.spongepowered.org/maven/org/spongepowered/spongevanilla/`
};

const install = async ({ type, version, build, minRam, maxRam }) => {
  const folder = 'mc_server';
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);
  process.chdir(folder);

  const finalJar = 'server.jar';

  const log = msg => console.log(`[CrazeCraft] ${msg}`);

  const handleDownload = (url, filename = `minecraft_${version}.jar`) => {
    log(`Downloading from: ${url}`);
    download(url, filename, err => {
      if (err) return console.error(`Download error: ${err}`);
      fs.renameSync(filename, finalJar);
      createLaunchScript(minRam, maxRam);
      log(`Server ready in '${folder}'! Run with './start.sh'`);
    });
  };

  if (type === 'paper' || type === 'waterfall') {
    const api = typeUrls[type](version);
    https.get(api, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        const builds = json.builds;
        const selectedBuild = build || builds[builds.length - 1].build;
        const dlUrl = `https://api.papermc.io/v2/projects/${type}/versions/${version}/builds/${selectedBuild}/downloads/${type}-${version}-${selectedBuild}.jar`;
        handleDownload(dlUrl);
      });
    });
  } else if (type === 'purpur') {
    https.get(typeUrls.purpur(version), res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        const latest = json.builds[json.builds.length - 1];
        const selectedBuild = build || latest;
        const url = `https://api.purpurmc.org/v2/purpur/${version}/${selectedBuild}/download`;
        handleDownload(url);
      });
    });
  } else if (type === 'spigot' || type === 'vanilla') {
    handleDownload(typeUrls[type](version));
  } else {
    console.log(`Support for ${type} not implemented yet in detail.`);
  }
};

module.exports = { install };
