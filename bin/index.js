#!/usr/bin/env node

const { install } = require('../lib/installer');
const readline = require('readline');

console.clear();
console.log("MINECRAFT INSTALLER\nMADE BY CRAFTINGCRAZEGAMING\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Server type (paper/spigot/forge/fabric/waterfall/purpur/sponge/vanilla): ", type => {
  rl.question("Version (e.g., 1.20.4): ", version => {
    rl.question("Build (leave blank if not needed): ", build => {
      rl.question("Min RAM (default 1G): ", minRam => {
        rl.question("Max RAM (default 2G): ", maxRam => {
          install({
            type: type.toLowerCase(),
            version,
            build,
            minRam: minRam || '1G',
            maxRam: maxRam || '2G'
          });
          rl.close();
        });
      });
    });
  });
});
