const loadPeerFromLocalStorage = () => {
  const initialState = { server: '', user: '', pass: '' };

  const peer = localStorage.getItem('peer');

  if (peer) {
    return JSON.parse(peer);
  }

  return initialState;
};

export default loadPeerFromLocalStorage;
