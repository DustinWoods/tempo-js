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
 - [ ] Slave/master tracks to sync timers or media
 - [ ] Implement events for start/stop/repeat click track
 - [ ] Tests
 - [ ] Include source maps in dist
 - [ ] Add calibration loop (begin anticipating the delay in code execution)
 - [ ] Publish code examples
   - [ ] Metronome
   - [ ] Rhythm game
   - [ ] YouTube video
   - [ ] Cues for tweening
   - [ ] Cues without tempo (ie 60bpm)
   - [ ] Basic cue mapping tool
 - [ ] Tempo maps for varying tempos
 - [ ] Readme documentation
 - [x] Remove dependencies (rxjs)
 - [x] Implement event triggers for beats and bars
 - [x] Parameter for track offset
 - [x] Add built-in ticker
 - [x] Add support for custom ticker
 - [x] Option to sync with html5 audio or video
 - [x] Option to sync with youtube iframe player
 - [x] Cue tracks
 - [x] Include minified/targeted build
 - [x] Handle @TODO's