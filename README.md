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

## Issues
 - [x] Using offset option and scrubbing audio begins to offset the click track (Turned out to be the file was reporting incorrect audio position. Nothing to do with offset. Exported as .ogg and fixed. Maybe to do with .mp3)
 - [ ] requestAnimationFrame in event callback doesn't last long enough for classes to be attached to DOM element

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
 - [ ] Publish code examples
 - [ ] Tempo maps for varying tempos
 - [ ] Include source maps in dist
 - [ ] Voice/instrument tracks
 - [x] Include minified/targeted build