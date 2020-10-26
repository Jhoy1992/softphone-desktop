const loadUserFromLocalStorage = () => {
  const initialState = { server: '', user: '', pass: '' };

  const user = localStorage.getItem('user');

  if (user) {
    return JSON.parse(user);
  }

  return initialState;
};

export default loadUserFromLocalStorage;
