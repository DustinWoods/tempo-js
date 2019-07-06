## Click Tracks for your JavaScript

**WIP - Still in early development**

### Description
Create JavaScript event emitter in browser for a click track. Specify tempo and time signature. Get event for each beat or each bar. Use built-in timer or specify your own. Sync timer with HTML5 audio.

### Install
`npm i click-track`

### Features
 - Typings for Typescript

## Issues
 - [ ] Using offset option and scrubbing audio begins to offset the click track

### TODO
 - [x] Remove dependencies (rxjs)
 - [ ] Tests
 - [x] Implement event triggers for beats and bars
 - [ ] Implement event triggers for start/stop/repeat click track
 - [x] Parameter for track offset
 - [ ] Add built-in ticker
 - [x] Add support for custom ticker
 - [ ] Option to sync with html5 audio or video
 - [ ] Publish code examples
 - [ ] Tempo maps for varying tempos
 - [ ] Voice/instrument tracks
 - [ ] Include minified/targeted build