# MAKE YOUR OWN PERSONAL MODEL (.pmdl)

1. Get Snowboy API token. API token can be obtained by logging into https://snowboy.kitt.ai. Click on “Profile settings”, then you can see your token.

2. go to trainer directory, and modify `trainer.sh`
```sh
nano trainer.sh
```
In the file, you can find where to modify.
```sh
############# MODIFY THE FOLLOWING #############
# Secret user token
TOKEN="put your snowboy API token here"
#String, or “unknown” if we don’t know hotword name
NAME="volume_up"
# ar (Arabic), zh (Chinese), nl (Dutch), en (English), fr (French), dt (German), hi (Hindi), it (Italian), jp (Japanese), ko (Korean), fa (Persian), pl (Polish), pt (Portuguese), ru (Russian), es (Spanish), ot (Other)
LANGUAGE="en"
# 0_9, 10_19, 20_29, 30_39, 40_49, 50_59, 60+
AGE_GROUP="40_49"
# F/M
GENDER="M"
# String, your microphone type
MICROPHONE="PS3 Eye"
############### END OF MODIFY ##################
```

3. Record your hotword(in this case, "volume up") 3 times on your RPI (`.pmdl` which is created on other device, might not work)
```sh
rec -r 16000 -c 1 -b 16 -e signed-integer 1.wav
rec -r 16000 -c 1 -b 16 -e signed-integer 2.wav
rec -r 16000 -c 1 -b 16 -e signed-integer 3.wav
```

4. Then, train them
```sh
./trainer.sh 1.wav 2.wav 3.wav volume_up.pmdl
```
You might get `data.json` and `voulme_up.pmdl`.

5. Move `.pmdl` to `models` directory
```sh
mv volume_up.pmdl ../models/
```

6. Now, make `recipe` or add this to your config
```js
models: [
  {
    hotwords    : "volume_up",
    file        : "volume_up.pmdl",
    sensitivity : "0.5",
  },
],
commands: {
  "volume_up" : {
    notificationExec: {
      notification: "VOLUME_UP"
    }
  }
},
```
