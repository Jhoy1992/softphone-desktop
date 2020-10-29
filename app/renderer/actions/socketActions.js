export const connect = server => ({
  type: 'CONNECT_SOCKET',
  payload: { server },
});

export const disconnect = socket => ({
  type: 'DISCONNECT_SOCKET',
  payload: { socket },
});
