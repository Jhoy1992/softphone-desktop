const PlayTone = (frequency1, frequency2, volume = 1) => {
  const audioContext = new window.AudioContext();

  const oscillator1 = audioContext.createOscillator();
  oscillator1.frequency.value = frequency1;

  const gainNode = audioContext.createGain
    ? audioContext.createGain()
    : audioContext.createGainNode();

  oscillator1.connect(gainNode, 0, 0);
  gainNode.connect(audioContext.destination);

  gainNode.gain.value = volume / 10;
  oscillator1.start(0);
  oscillator1.stop(audioContext.currentTime + 0.18);

  const oscillator2 = audioContext.createOscillator();
  oscillator2.frequency.value = frequency2;

  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);

  gainNode.gain.value = volume / 10;
  oscillator2.start(0);
  oscillator2.stop(audioContext.currentTime + 0.18);
};

export default PlayTone;
