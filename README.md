## Click Tracks for your JavaScript

**WIP - Still in early development**

### Description
Create JavaScript event emitter in browser for a click track. Specify tempo and time signature. Get event for each beat or each bar. Use built-in timer or specify your own. Sync timer with HTML5 audio.

### Install
`npm i click-track`

### Features
 - Typings for Typescript
 - Sync with HTML Audio or Video element
 - Sync with YouTube player

### TODO
 - [x] Remove dependencies (rxjs)
 - [ ] Tests
 - [x] Implement event triggers for beats and bars
 - [ ] Implement event triggers for start/stop/repeat click track
 - [x] Parameter for track offset
 - [x] Add built-in ticker
 - [x] Add support for custom ticker
 - [x] Option to sync with html5 audio or video
 - [x] Option to sync with youtube iframe player
 - [ ] Include source maps in dist
 - [ ] Cue tracks
 - [x] Include minified/targeted build
 - [ ] Add calibration loop (begin anticipating the delay in code execution)
 - [ ] Slave/master tracks to sync timers or media
 - [ ] Handle @TODO's
 - [ ] Publish code examples
   - [ ] Metronome
   - [ ] Rhythm game
   - [ ] YouTube video
   - [ ] Cues for tweening
   - [ ] Cues without tempo (ie 60bpm)
   - [ ] Basic cue mapping tool
 - [ ] Tempo maps for varying tempos
 - [ ] Readme documentation