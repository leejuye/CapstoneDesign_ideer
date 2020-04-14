# Default Universal models and recommended properties
```js
{
  hotwords: "smart_mirror",
  file: "smart_mirror.umdl",
  sensitivity: "0.5",
},
{
  hotwords: "computer",
  file: "computer.umdl",
  sensitivity: "0.6",
},
{
  hotwords: "snowboy",
  file: "snowboy.umdl",
  sensitivity: "0.5",
},
{
  hotwords: ["jarvis", "jarvis"],
  file: "jarvis.umdl",
  sensitivity: "0.8,0.8",
},
{
  hotwords: "subex",
  file: "subex.umdl",
  sensitivity: "0.6",
},
{
  hotwords: ["neo_ya", "neo_ya"],
  file: "neoya.umdl",
  sensitivity: "0.7,0.7",
},
{
  hotwords: "hey_extreme",
  file: "hey_extreme.umdl",
  sensitivity: "0.6",
},
{
  hotwords: "view_glass",
  file: "view_glass.umdl",
  sensitivity: "0.7",
},
```
When you are using `.pmdl`, set `detectorApplyFrontend` to `false`.

For `.umdl`, When you use only`snowboy` and `smart_mirror`, `false` is better. But with other models, `true` is better.

Basically, just leave it unless you have some problem to detect hotwords.
