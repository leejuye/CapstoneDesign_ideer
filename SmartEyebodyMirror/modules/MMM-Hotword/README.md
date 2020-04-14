## MMM-Hotword
MMM-Hotword is a hotword detector using snowboy.
You can use this module to wake another voice assistant or to give a command to other module.

### Screenshot
![screenshot](resources/screenshot.png)

### UPDATES

**2.1.0 (2020-01-13)**
- Installer being updated. (Now it will check your dependencies and sound environment)
- New recipe for `MMM-AssistantMk2 (v3)` being added.




#### How to update (From previous version 1.X)
- You need to remove old MMM-Hotword directory then re-install from scratch again.
- Configuration should be re-written. It is not compatible with old version.


### Installation
Read [Wiki:install](https://github.com/eouia/MMM-Hotword/wiki/Installation)

### (OPTIONAL) Get your personal model (.pmdl)
Instead using universal model, You can make your own personal model. (ex. `Hey,Dude`, `volume up`, ...)

Read [wiki:trainer](https://github.com/eouia/MMM-Hotword/wiki/Make-your-own-personal-model)
- Personal model is dedicated to each specific vocal pattern. You cannot share your model with others.
- Personal model should be created on target device and mic. It might not work on other device.

### Or.. For universal model (.umdl)
Read [wiki:models](https://github.com/eouia/MMM-Hotword/wiki/Models)



### UPDATE HISTORY
**2.0.3 (2020-01-08)**
- Create auto-installer via npm install for RPI/Linux (manual installation is always available)
- Create post install script for check Mic configuration

**2.0.2 (2019-12-04)**
- Fix: issue of `HOTWORD_RESUME` notification not working
- Fix: some bugs of omitted configuration field.
- Add: some more front-end log to check `command` working

**2.0.1 (2019-05-20)**
- Fix: issue of afterRecording couldn't stop
- Add: `afterRecordLimit` to stop recording by force.

**2.0.0 (2019-05-19)**
- Whole new build-up
- Some annoying dependencies are removed.
- Installer is provided. (`installer/install.sh`)
- Personal model trainer is provided. (`trainer/trainer.sh`)
- Continuous recording after hotword detection is supported (Now you can say like "Computer, volume up" without pausing between `Computer` and `volume up`)
  - This feature could be used with `MMM-AssistantMk2 ver3.x`(Not yet released, but will arrive soon)
  - Or you can use this feature with other AI or Speech-To-Text program.
- Simple standalone commands could be available. (Without any Assistant or Speech-To-Text, you can make own voice commands with this module standalone.). Commands could be combined sequence (You can make "volume-louder" with voice models "volume" and "louder")
- More universal models are added. (`computer`, `subex`, `hey extreme` and more.)
- Hotword detected could be displayed on screen of MM.

**1.1.0 (2018-11-4)**
- notification configurable. (You don't need `MMM-NotificationTrigger` any more for using with `MMM-AssistantMk2(^2.0.0)`)
- But if you want more complex action chains, you can still use `MMM-NotificationTrigger` also.



### Last Tested; (2019-05-19)
- MagicMirror : v2.7.1
- Tested Environment :
  - Raspbian Stretch (Raspbian 3B+) / node v8.16.0 / npm v6.4.1
  - TinkerOS (TinkerBoard)
  - Ubuntu 18.04 (NVIDIA Jetson Nano)
  - OSX 10.14.4 (Apple MacBookPro) / node v11.12.0 / npm v6.7.0
