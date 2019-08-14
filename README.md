## Click Tracks for your JavaScript

**WIP - Still in early development**

### Description
Create JavaScript event emitter in browser for a click track. Specify tempo and time signature. Get event for each beat or each bar. Use built-in timer or specify your own. Sync timer with HTML5 audio.

### Install
`npm i click-track`

### Usage

**Basic timer running at 120 bpm**
```javascript
  const track = new ClickTrack({
    tempo: 120,
    autostart: true,
  });

  track.on('beat', (e) => {
    console.log(e.beat);
  });

  // Outputs 1, 2, 3, 4.... at 120 bpm
```

**Basic timer running at 60 bpm**
```javascript
  const track = new ClickTrack({
    autostart: true,
  });

  track.on('beat', (e) => {
    console.log(e.beat);
  });

  // Outputs 1, 2, 3, 4.... at 60 bpm
```

**Basic cues**
```javascript
  const track = new ClickTrack({
    cues: [1, 3, 5, 7],
    autostart: true,
  }});

  track.on('cue', (e) => {
    console.log(e.beat);
  });

  // Outputs 1, 2, 3, 4 at 1 second, 3 seconds, 5 seconds, and then 7 seconds
```

**Basic cues with tempo**
```javascript
  const track = new ClickTrack({
    cues: [1, 3, 5, 7],
    tempo: 120,
    autostart: true,
  }});

  track.on('cue', (e) => {
    console.log(e.beat);
  });

  // Outputs 1, 2, 3, 4 at 0.5 second, 1.5 seconds, 2.5 seconds, and then 3.5 seconds
```

**Basic cues with data**
```javascript
  const track = new ClickTrack({
    cues: [[1, "A"], [3, "B"], [5, "C"], [7, "D"]],
    tempo: 120,
    autostart: true,
  }});

  track.on('cue', (e) => {
    console.log(e.data);
  });

  // Outputs "A", "B", "C", "D" at 0.5 second, 1.5 seconds, 2.5 seconds, and then 3.5 seconds
```

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