/**
 * Utility for playing audio notifications
 * Supports both audio files and programmatically generated sounds
 */

// Path to custom timer sound file (if you add one to public/sounds/)
const TIMER_SOUND_PATH = "/sounds/timer-complete.mp3";

/**
 * Generate a smooth, recognizable "ding-dong" doorbell sound using Web Audio API
 * Creates a gentle two-tone alert pattern that's pleasant and clearly signals
 * "time to start again" - like a soft, soothing doorbell
 */
function generateTimerSound(): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    if (!window.AudioContext && !(window as any).webkitAudioContext) {
      reject(new Error("Web Audio API not supported"));
      return;
    }

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const sampleRate = audioContext.sampleRate;
    const duration = 0.9; // 900ms for a smooth ding-dong pattern
    const buffer = audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate
    );
    const data = buffer.getChannelData(0);

    // Traditional "ding-dong" pattern: Higher "ding" followed by lower "dong"
    const dingStart = 0.0;
    const dingDuration = 0.2; // "Ding" - shorter, higher tone
    const dongStart = 0.35; // Brief pause between tones
    const dongDuration = 0.3; // "Dong" - longer, lower tone

    // Frequencies: Higher "ding" (E5) and lower "dong" (A4) - perfect fourth interval
    // This is a classic doorbell interval that's pleasant and recognizable
    const dingFreq = 659.25; // E5 - bright "ding"
    const dongFreq = 440; // A4 - warm "dong"

    // Rich but gentle harmonics for a smooth bell-like timbre
    const harmonics = [
      { freq: 1, amp: 0.45 }, // Fundamental - strongest
      { freq: 2, amp: 0.25 }, // Octave
      { freq: 3, amp: 0.15 }, // Perfect fifth
      { freq: 4, amp: 0.08 }, // Two octaves
    ];

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      const inDing = t >= dingStart && t < dingStart + dingDuration;
      const inDong = t >= dongStart && t < dongStart + dongDuration;

      if (inDing) {
        // "Ding" - Higher, brighter tone with smooth attack and decay
        const toneTime = t - dingStart;
        const attackTime = 0.08; // Smooth, gentle attack
        const attack =
          toneTime < attackTime
            ? Math.sin(((toneTime / attackTime) * Math.PI) / 2) // Smooth sine fade-in
            : 1;
        // Gentle exponential decay
        const decay = Math.exp(-toneTime * 4);
        const envelope = attack * decay;

        harmonics.forEach((harmonic) => {
          sample +=
            Math.sin(2 * Math.PI * dingFreq * harmonic.freq * toneTime) *
            harmonic.amp *
            envelope;
        });
      } else if (inDong) {
        // "Dong" - Lower, warmer tone with smooth attack and longer decay
        const toneTime = t - dongStart;
        const attackTime = 0.1; // Slightly longer attack for smoothness
        const attack =
          toneTime < attackTime
            ? Math.sin(((toneTime / attackTime) * Math.PI) / 2) // Smooth sine fade-in
            : 1;
        // Longer, smoother decay for the "dong"
        const decay = Math.exp(-toneTime * 2.5);
        const envelope = attack * decay;

        harmonics.forEach((harmonic) => {
          sample +=
            Math.sin(2 * Math.PI * dongFreq * harmonic.freq * toneTime) *
            harmonic.amp *
            envelope;
        });
      }

      // Very smooth processing - no harsh clipping
      data[i] = sample * 0.5; // Gentle volume for a soothing sound
    }

    resolve(buffer);
  });
}

/**
 * Play a generated timer sound
 */
async function playGeneratedTimerSound(): Promise<void> {
  try {
    const buffer = await generateTimerSound();
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = 0.5; // Lower volume for a gentler, soothing sound

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return new Promise((resolve) => {
      source.onended = () => {
        audioContext.close();
        resolve();
      };
      source.start(0);
    });
  } catch (error) {
    console.error("Failed to play generated timer sound:", error);
    throw error;
  }
}

/**
 * Play an audio file from the public folder
 */
function playAudioFile(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(path);
    audio.volume = 0.7;

    audio.onended = () => {
      resolve();
    };

    audio.onerror = (error) => {
      reject(error);
    };

    audio.play().catch((error) => {
      reject(error);
    });
  });
}

/**
 * Get available voices, ensuring they're loaded
 */
function getVoices(): SpeechSynthesisVoice[] {
  let voices = window.speechSynthesis.getVoices();

  // If voices aren't loaded yet, wait for them
  if (voices.length === 0) {
    // Trigger voice loading (some browsers need this)
    window.speechSynthesis.getVoices();
    voices = window.speechSynthesis.getVoices();
  }

  return voices;
}

/**
 * Find the best available female voice for notifications
 */
function findBestVoice(): SpeechSynthesisVoice | null {
  const voices = getVoices();

  if (voices.length === 0) {
    return null;
  }

  // Common female voice name patterns across different platforms
  const femaleVoicePatterns = [
    "Samantha",
    "Karen",
    "Victoria",
    "Siri",
    "Zira",
    "Samantha (Enhanced)",
    "Samantha (Premium)",
    "Samantha (Neural)",
    "Karen (Enhanced)",
    "Victoria (Enhanced)",
    "Siri (Enhanced)",
    "Female",
    "Woman",
    "Woman's",
    "Alex",
    "Allison",
    "Ava",
    "Kate",
    "Moira",
    "Tessa",
    "Veena",
    "Fiona",
    "Susan",
    "Nora",
  ];

  // First, try to find a high-quality female voice with enhanced/neural/premium
  const preferredFemaleVoice = voices.find(
    (voice) =>
      voice.lang.startsWith("en") &&
      femaleVoicePatterns.some((pattern) => voice.name.includes(pattern)) &&
      (voice.name.includes("Enhanced") ||
        voice.name.includes("Premium") ||
        voice.name.includes("Neural"))
  );

  if (preferredFemaleVoice) {
    return preferredFemaleVoice;
  }

  // Fallback: any female voice
  const anyFemaleVoice = voices.find(
    (voice) =>
      voice.lang.startsWith("en") &&
      femaleVoicePatterns.some((pattern) => voice.name.includes(pattern))
  );

  if (anyFemaleVoice) {
    return anyFemaleVoice;
  }

  // Last resort: any English voice
  return (
    voices.find((voice) => voice.lang.startsWith("en")) || voices[0] || null
  );
}

/**
 * Play a text-to-speech notification
 * @param text The text to speak
 * @param options Optional configuration for speech synthesis
 */
export function playAudioNotification(
  text: string,
  options?: {
    volume?: number;
    rate?: number;
    pitch?: number;
    voice?: SpeechSynthesisVoice;
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported");
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set default options
    utterance.volume = options?.volume ?? 0.8;
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;

    // Try to use a more natural-sounding voice if available
    if (options?.voice) {
      utterance.voice = options.voice;
    } else {
      const preferredVoice = findBestVoice();
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (error) => {
      console.error("Speech synthesis error:", error);
      reject(error);
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Play a rest timer completion notification
 * Pattern: Timer sound + Voice message "Rest time is over"
 * Uses a distinctive app-specific timer sound that users will recognize
 */
export async function playRestTimerCompleteNotification(): Promise<void> {
  // Step 1: Play the distinctive timer sound first
  try {
    // Try custom audio file first
    try {
      await playAudioFile(TIMER_SOUND_PATH);
    } catch (fileError) {
      // Custom file doesn't exist or failed, use generated sound
      console.debug("Custom timer sound not found, using generated sound");
      await playGeneratedTimerSound();
    }
  } catch (soundError) {
    console.debug("Timer sound playback failed:", soundError);
    // Continue to voice message even if sound fails
  }

  // Step 2: Play the voice message
  const message = "Rest time is over.";

  try {
    await playAudioNotification(message, {
      volume: 0.85,
      rate: 0.9, // Slightly slower for a more soothing effect
      pitch: 1.15, // Slightly higher pitch for a more feminine, soothing tone
    });
  } catch (ttsError) {
    console.error("Voice notification failed:", ttsError);
    // At least the timer sound played, which is the most important part
  }
}
