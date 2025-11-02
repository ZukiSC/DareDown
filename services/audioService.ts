// Since we are loading Howler from a CDN, we need to declare the global variables
// to satisfy TypeScript.
declare var Howl: any;
declare var Howler: any;

// Sound sources from Google Actions and Pixabay (free to use)
const SOUND_SOURCES = {
  gameStart: 'https://actions.google.com/sounds/v1/games/game_start.ogg',
  nextRound: 'https://actions.google.com/sounds/v1/transitions/swoosh_accent.ogg',
  dareComplete: 'https://cdn.pixabay.com/download/audio/2022/11/17/audio_835431d1b3.mp3?filename=success-fanfare-trumpets-6185.mp3',
  correct: 'https://actions.google.com/sounds/v1/events/positive_notification.ogg',
  incorrect: 'https://actions.google.com/sounds/v1/events/failure_notification.ogg',
  tap: 'https://actions.google.com/sounds/v1/ui/button_press.ogg',
  timesUp: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
  numberClick: 'https://actions.google.com/sounds/v1/ui/camera_shutter.ogg',
  winGame: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_275101a1e1.mp3?filename=level-win-6416.mp3',
  powerUp: 'https://actions.google.com/sounds/v1/magic/magic_chime.ogg',
};

type SoundKeys = keyof typeof SOUND_SOURCES;

// Create a map for Howl instances, typed to allow for undefined until loaded.
const audioClips: { [key in SoundKeys]?: any } = {};

let areSoundsPreloaded = false;

// Function to preload all sounds
export const preloadSounds = () => {
    if (areSoundsPreloaded) return;
    
    console.log('Preloading sounds...');
    for (const key in SOUND_SOURCES) {
        if (Object.prototype.hasOwnProperty.call(SOUND_SOURCES, key)) {
            const soundKey = key as SoundKeys;
            if (!audioClips[soundKey]) {
                audioClips[soundKey] = new Howl({
                    src: [SOUND_SOURCES[soundKey]],
                    volume: (key === 'tap' || key === 'numberClick') ? 0.4 : 0.7,
                    html5: true // Often helps with browser compatibility
                });
            }
        }
    }
    areSoundsPreloaded = true;
};

// Function to play a sound
export const playSound = (sound: SoundKeys) => {
  const audio = audioClips[sound];
  if (audio) {
    audio.play();
  } else {
    // This might happen if sounds haven't been preloaded yet
    console.warn(`Sound not loaded yet: ${sound}. Preloading now.`);
    preloadSounds();
    audioClips[sound]?.play();
  }
};

// Mute control
export const toggleMute = (mute: boolean) => {
    Howler.mute(mute);
};
