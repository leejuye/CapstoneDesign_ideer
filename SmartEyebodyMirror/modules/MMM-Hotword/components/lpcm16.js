'use strict'

var spawn = require('child_process').spawn

class LPCM16 {
  constructor (options, streamOut, afterCallback) {
    this.cp = null
    var defaults = {
      sampleRate: 16000,
      channels: 1,
      compress: false,
      threshold: 0.5,
      thresholdStart: null,
      thresholdEnd: null,
      silence: '1.0',
      verbose: false,
      recordProgram: 'rec'
    }
    this.options = Object.assign(defaults, options)
    this.stream = null
    this.streamOut = streamOut
    this.afterCallback = afterCallback
    this.cp = null
    this.terminated = false
  }

  start () {
    this.terminated = false
    var options = this.options
    // Capture audio stream
    var cmd, cmdArgs, cmdOptions
    switch (options.recordProgram) {
      // On some Windows machines, sox is installed using the "sox" binary
      // instead of "rec"
      case 'sox':
        var cmd = 'sox';
        var cmdArgs = [
          '-q',                     // show no progress
          '-t', 'waveaudio',        // audio type
          '-d',                     // use default recording device
          '-r', options.sampleRate, // sample rate
          '-c', options.channels,   // channels
          '-e', 'signed-integer',   // sample encoding
          '-b', '16',               // precision (bits)
          '-',                      // pipe
          // end on silence
          'silence', '1', '0.1', options.thresholdStart || options.threshold + '%',
          '1', options.silence, options.thresholdEnd || options.threshold + '%'
        ];
        break
      case 'rec':
      default:
        cmd = options.recordProgram
        cmdArgs = [
          '-q',                     // show no progress
          '-r', options.sampleRate, // sample rate
          '-c', options.channels,   // channels
          '-e', 'signed-integer',   // sample encoding
          '-b', '16',               // precision (bits)
          '-t', 'wav',              // audio type
          '-',                      // pipe
           //end on silence
          'silence', '1', '0.1', options.thresholdStart || options.threshold + '%',
          '1', options.silence, options.thresholdEnd || options.threshold + '%'
        ]
        break
      // On some systems (RasPi), arecord is the prefered recording binary
      case 'arecord':
        cmd = 'arecord'
        cmdArgs = [
          '-q',                     // show no progress
          '-r', options.sampleRate, // sample rate
          '-c', options.channels,   // channels
          '-t', 'wav',              // audio type
          '-f', 'S16_LE',           // Sample format
          '-'                       // pipe
        ]
        if (options.device) {
          cmdArgs.unshift('-D', options.device)
        }
        break
      case 'parec':
        cmd = 'parec'
        cmdArgs = [
          '--rate', options.sampleRate,   // sample rate
          '--channels', options.channels, // channels
          '--format', 's16le',            // sample format
        ]
        if (options.device) {
          cmdArgs.unshift('--device', options.device)
        }
        break
    }

    // Spawn audio capture command
    cmdOptions = { encoding: 'binary', shell: true}
    if (options.device) {
      cmdOptions.env = Object.assign({}, process.env, { AUDIODEV: options.device })
    }

    this.cp = spawn(cmd, cmdArgs, cmdOptions)
    this.cp.stderr.on('data', (data) => {
      var dataToString = data.toString()
      if (dataToString.search("WARN" > -1)) {
        return
      } else {
        this.stream.destroy()
        return this.afterCallback(data.toString())
      }
    })
    this.cp.on("exit", (c,s)=>{
      this.stream.destroy()
      this.afterCallback()
    })

    this.stream = this.cp.stdout
    if (options.verbose) {
      console.log(
        '[HOTWORD:LPCM16] Start listening',
        options.channels,
        'channels with sample rate',
        options.sampleRate
      )
      console.time('[HOTWORD:LPCM16] End listening')
    }
    this.stream.on('data', (data) => {
      if (options.verbose) console.log('[HOTWORD:LPCM16] Listening %d bytes', data.length)
    })

    this.stream.on('end', () => {
      if (options.verbose) console.timeEnd('[HOTWORD:LPCM16] End listening')
    })

    this.stream.pipe(this.streamOut)
  }

  stop () {
    if (!this.cp) {
      console.log('[HOTWORD:LPCM16] STOP is called without STARTING')
      return false
    }
    this.stream.unpipe(this.streamOut)
    this.cp.kill("SIGTERM") // Exit the spawned process, exit gracefully
    this.options = null
    this.streamOut = null
    this.terminated = true
  }
}

module.exports = LPCM16
