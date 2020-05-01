# MMM-AssistantMk2
![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/master/resources/AMk2_Big.png)
`MMM-AssistantMk2` is an embedded Google assistant on MagicMirror.

## NEW UPDATES
**3.2.1 (16/04/2020)**
 * **FIX**: Send A2D response only on no hooked response
 * **FIX**: repository change owner
 * **ADD**: preprared recipe with-radio_fr.js recipe for A2D Radio (FR Only)
 * **ADD**: npm run rebuild -> REFRESH installation on MagicMirror version change

**3.2.0 (09/04/2020)**
 * **ADD**: Chinese_simplified translate (thx to @wlmqpsc)
 * **ADD**: ability to play personnal sound on recipes soundExec command (see wiki)
 * **FIX**: no fade in animation on first use in Fullscreen ui
 * **DEL**: full addon code and cleanning
 * **ADD**: add control if A2D used

## [**Preview Video**](https://youtu.be/e7Xg95mL8JE)

## Screenshot
- Classic UI

![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/master/resources/previewUI.jpg)

- FullScreen UI

![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/master/resources/previewFS.jpg)

## What is updated on V3
- Fully rebuild from scratch.
- More stable.
- Installer is served. (For Raspbian or any Debian-based Linux)
- Annoying audio output dependencies are deprecated. Simply using standard HTML5 audio output.
- `plugin` and `responseHook` are added.
- screen output is more controllable.
- customizable UI.
- pre-built recipes are served.
- Easier `custom action` managing.

## Installation, update & Guides
Read the docs in [wiki](https://github.com/eouia/MMM-AssistantMk2/wiki)<br>
[简体中文 Chinese_simplified](./translations/Chinese_simplified/README_zh-CN.md)
## Update from 2.x
Not easy. Remove existence then reinstall fresh.
- You'd better backup your `credentials.json` and profiles.

## Update from 3.x

```sh
cd ~/MagicMirror/modules/MMM-AssistantMk2
npm run update
```

## Update on new MagicMirror version (exemple v2.10.x to v2.11.x)
```sh
cd ~/MagicMirror/modules/MMM-AssistantMk2
npm run rebuild
```

## UPDATE HISTORY
**3.1.2 (17/03/2020)**
 * **FIX**: No sound response issue when custom action is used.
 * **FIX**: correct youtube search link.
 * **ADD**: Add A2D stop command (beta)

**3.1.1-2 (06/03/2020)**
 * **ADD/MODIFY**: `ui: "Fullscreen"`
   * `position: "fullscreen_above"` is now ui like `Google Home`
 * **MODIFY**: user interface priority order Assistant2Display -> AMk2
 * **ADD**: move native sound to class

**3.1.1-1 (05/03/2020)**
 * **FIX**: correct audio cutting response for mpg321 (test)
 * **ADD**: add cvlc audio out support (vlc using)

**3.1.1-0 (02/03/2020)**
 * **ADD**: add new function for addons-recipe (socketExec, onSocketExec)
 * **FIX**: continous conversation bug - infinite loop on no user response
 * **FIX**: double chimed on TRANSCRIPTION_FAILS retry
 * **FIX**: ability to set no chime on activate assistant
 * **FIX**: touching the keyword "try to say" activates the assistant for the suggested search (Fullscreen and Classic2 ui)
 * **ADD**: ASSISTANT_WEB server for activate with keyword
 * **MOTIFY** : search KEYWORD/ TRYTOSAY translation script to improve performance
 * **FIX**: correct screen parser log

**3.1.0-3 (07/02/2020)**
 * **BUG**: correct issue with no response audio and play-sound (freeze)

**3.1.0-2 (05/02/2020)**
 * **DELETE/MOVE**: addonsConfig:{} is noved to addons/addons.js
 * **ADD/CONFIG**: addons: BOOLEAN to activate or not addons.js
 * **ADD**: touch icon to activate assistant

**3.1.0-1 (30/01/2020)**
  * **ADD/CONFIG:** ability to add a personal addons in node_helper (addons.js)
  * **ISSUE:** correct mmap issue :
    * choice HTML5 audio or native audio
  * **CONFIG:** reduce CPU usage by ability to disable animated icons
  * **ADD:** volume control via [MMM-Volume](https://github.com/eouia/MMM-Volume)
  * **ADD/CONFIG:** ability to use static icons
  * **CONFIG:** ability to use personal chimes
  * **ADD:** npm install with new dependencies
  * **ADD:** added update script (npm run update)

**3.0.2 (2020-01-23)**
- CHANGED : To use smaller memory, `bufferToWav` is changed to `bufferToMP3` and some logic improved.

**3.0.1 (2020-01-22)**
- fixed: `node-record-lpcm16` issue. (Mic not working issue.)


## Last Tested
- MagicMirror : 2.10.0
- RPI 3B+ / raspbian 10 /nodeJS v10.17.0 / npm 6.13.2
- MacOS Catalina 10.15.2 / MacBookPro 2017 15" / nodeJS v11.12.0 / npm v6.9.0
- debian 10 / nodeJS v10.18.0 / npm v6.13.4

## Credits
- Author :
  - @eouia
  - @bugsounet
  - @Anonym-tsk
- Chinese simplified translate :
  - @wlmqpsc
- License : MIT
  - **By terms of Google Assistant SDK, You are not allowed to use or provide this module for commercial purpose.**
