export const saveUser = data => ({
  type: 'SAVE_USER',
  payload: { ...data },
});
