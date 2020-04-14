# HOW TO INSTALL

## From Old version (v 1.x.x)
You need to remove your old module then re-install freshly.
```sh
cd ~/MagicMirror/modules
rm -rf MMM-Hotword
```

## Auto Install
```sh
sudo apt update
sudo apt upgrade
sudo apt install libmagic-dev libatlas-base-dev sox libsox-fmt-all

cd ~/MagicMirror/modules
git clone https://github.com/eouia/MMM-Hotword.git
cd MMM-Hotword

chmod +x ./installer/install.sh
./installer/install.sh
```
It will take 10~30 min. Don't power off during the installation.

If you can see something with these similar on last part of installation log, Installation would be success
```sh
Rebuild Complete
electron-v3.0-linux-arm  node-v57-linux-arm
lib/node/index.js
```
`electron-v3.0-linux-arm` or `node-v57-linux-arm` may be different by your environment.

## Manual Install
If Auto installation is not working, you can install manually by yourself.
```sh
sudo apt update
sudo apt upgrade
sudo apt install libmagic-dev libatlas-base-dev sox libsox-fmt-all
cd ~/MagicMirror/modules
git clone https://github.com/eouia/MMM-Hotword.git
cd MMM-Hotword
chmod +x trainer/trainer.sh
git clone https://github.com/Kitt-AI/snowboy.git
cd snowboy
rm -rf .git
cp -r resources/models ..
npm install -y nan node-pre-gyp
./node_modules/node-pre-gyp/bin/node-pre-gyp clean configure build
npm install -y
npm install -y electron-rebuild
./node_modules/.bin/electron-rebuild
```
After `Rebuild Complete` messages, check these;
```sh
ls ~/MagicMirror/modules/MMM-Hotword/snowboy/lib/node/binding/Release
ls ~/MagicMirror/modules/MMM-Hotword/snowboy/lib/node/index.js
```

## Enable HTML5 media autoplay
After recent Google Chrome(Chromium) updates, Under some environments MagicMirror cannot auto-play HTML5 audio/video without user's interaction. In that case, modify MagicMirror source code. This feature could be automatically applied by default from MM 2.8.0. If you don't use `chimeOnFinish` feature, you don't have to do this.

Open `~/MagicMirror/js/electron.js` then find this.
```js
const app = electron.app;
```
Change it to this.
```js
const app = electron.app;
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
```

## I want to use old version (1.x)
If you want to use old version of this module,
```sh
cd ~/MagicMirror/modules/MMM-Hotword
git checkout 1.1.0
```
