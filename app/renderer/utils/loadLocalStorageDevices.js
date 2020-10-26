const loadDevicesFromLocalStorage = () => {
  const initialState = {};

  const speaker = localStorage.getItem('speaker');
  if (speaker) {
    initialState.devices = { ...initialState.devices, speaker: { ...JSON.parse(speaker) } };
  }

  const headphone = localStorage.getItem('headphone');
  if (headphone) {
    initialState.devices = { ...initialState.devices, headphone: { ...JSON.parse(headphone) } };
  }

  const microphone = localStorage.getItem('microphone');
  if (microphone) {
    initialState.devices = { ...initialState.devices, microphone: { ...JSON.parse(microphone) } };
  }

  return initialState.devices;
};

export default loadDevicesFromLocalStorage;
