# Click Tracks for your JavaScript
A light-weight utility for emitting events that are in-time with music.

## Description
The main export is a constructor that can be called with differently based on use-case. Some examples are:
 - Emit events for every beat timed with an audio/video source
 - Emit events for every beat with out a source
 - Emit events at defined cues, like music notation

## Install
`npm i click-track`

## Usage

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
    // Tempo defaults to 60
  });

  track.on('beat', (e) => {
    console.log(e.beat);
  });

  // Outputs 1, 2, 3, 4.... at 60 bpm
```

**Basic cues**
When the default tempo is 60, the cues are synonymous with seconds
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

  // Outputs 1, 2, 3, 4 at 0.5 second (beat 1), 1.5 seconds (beat 3), 2.5 seconds (beat 5), and then 3.5 seconds (beat 7)
```

**Basic cues with data**
To pass data with each cue, use tuples for each cue.
```javascript
  const track = new ClickTrack({
    cues: [[1, "A"], [3, "B"], [5, "C"], [7, "D"]],
    tempo: 120,
    autostart: true,
  }});

  track.on('cue', (e) => {
    console.log(e.data);
  });

  // Outputs "A", "B", "C", "D" at 0.5 second (beat 1), 1.5 seconds (beat 3), 2.5 seconds (beat 5), and then 3.5 seconds (beat 7)
```

## TODO
 - [ ] Upgrade typescript dep
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