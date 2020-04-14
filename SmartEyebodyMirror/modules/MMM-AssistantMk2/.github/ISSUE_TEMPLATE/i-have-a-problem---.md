---
name: I have a problem...
about: Have you a problem to use this?
title: ''
labels: ''
assignees: ''

---

**Describe the problem**
A clear and concise description of what the problem you have.

**To Reproduce**
Steps to reproduce the behavior: (Describe what did you do)

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - Device : [e.g. RPI 3b+]
 - OS: [e.g. Raspbian Stretch]
 - Node Version :
 - Etc.

**Before you post issue, try this first**
- Confirm you have completed installation with instruction. (If you have a problem on installation step, find other similar issues or follow instruction carefully. But if you failed again, post issue here.)
- To make things simple, disable or omit or outcomment other modules from config.js except MMM-AssistantMk2 and MMM-Hotword.
- Add `verbose:true` to MMM-Assistant `config:{}` and `testMic:true` to MMM-Hotword `config:{}`. 
- Copy your content of `config.js` and paste it into http://esprima.org/demo/validate.html to check whether you have syntax error or not. If there might be errors, usually your issue will be solved by fix those errors.
- If you are using `pm2` to execute MM, stop pm2 (`pm2 stop mm`) then execute `npm start dev` on your MagicMirror directory. It will show front-end log on dev-console of MM, and back-end log on your shell terminal. Both logs are needed to examine.

Then report me.
