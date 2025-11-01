let localStream: MediaStream | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let microphone: MediaStreamAudioSourceNode | null = null;
let javascriptNode: ScriptProcessorNode | null = null;
let animationFrameId: number | null = null;

const SPEECH_THRESHOLD = 20; // Volume threshold to be considered "speaking"
const SILENCE_DELAY = 150; // ms of silence before "stopped speaking" is triggered

let silenceTimeout: number | null = null;
let wasSpeaking = false;

export const voiceService = {
  startLocalStream: async (onSpeaking: () => void, onStoppedSpeaking: () => void): Promise<MediaStream | null> => {
    if (localStream) {
      return localStream;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream = stream;
      
      // @ts-ignore
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);
      // createScriptProcessor is deprecated, but simpler for this simulation than AudioWorklet
      javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);

      javascriptNode.onaudioprocess = () => {
        if (!analyser || !localStream?.getAudioTracks().some(t => t.enabled)) {
            if(wasSpeaking) {
                onStoppedSpeaking();
                wasSpeaking = false;
            }
            return;
        }
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        let values = 0;
        const length = array.length;
        for (let i = 0; i < length; i++) {
          values += (array[i]);
        }
        const average = values / length;

        if (average > SPEECH_THRESHOLD) {
          if (silenceTimeout) {
            clearTimeout(silenceTimeout);
            silenceTimeout = null;
          }
          if (!wasSpeaking) {
            onSpeaking();
            wasSpeaking = true;
          }
        } else {
            if (!silenceTimeout && wasSpeaking) {
                silenceTimeout = window.setTimeout(() => {
                    onStoppedSpeaking();
                    wasSpeaking = false;
                    silenceTimeout = null;
                }, SILENCE_DELAY);
            }
        }
      };
      
      return stream;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access was denied. Voice chat will not be available. Please enable it in your browser settings and refresh.");
      return null;
    }
  },

  stopLocalStream: () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (javascriptNode) {
        javascriptNode.onaudioprocess = null;
        javascriptNode.disconnect();
        javascriptNode = null;
    }
    if (analyser) {
        analyser.disconnect();
        analyser = null;
    }
    if (microphone) {
        microphone.disconnect();
        microphone = null;
    }
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
      audioContext = null;
    }
    wasSpeaking = false;
    if(silenceTimeout) clearTimeout(silenceTimeout);
  },

  toggleMute: (isMuted: boolean) => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  },
};
