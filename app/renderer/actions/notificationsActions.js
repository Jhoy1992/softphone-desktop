export const addNotification = data => ({
  type: 'ADD_NOTIFICATION',
  payload: { id: +new Date(), ...data },
});

export const removeNotification = id => ({
  type: 'REMOVE_NOTIFICATION',
  payload: { id },
});
