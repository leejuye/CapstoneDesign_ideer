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
ls lib/node/binding/Release
ls lib/node/index.js
