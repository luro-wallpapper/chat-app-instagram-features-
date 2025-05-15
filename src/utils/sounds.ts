// Create an audio element for message sound
let audioContext: AudioContext | null = null;

export const playMessageSound = () => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Simple beep sound using Web Audio API
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 1000; // Hz
    gainNode.gain.value = 0.1; // Lower volume
    
    // Short beep
    oscillator.start();
    
    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.error('Error playing sound:', error);
    // Silently fail if audio can't be played
  }
};