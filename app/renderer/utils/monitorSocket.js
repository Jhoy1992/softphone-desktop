import io from 'socket.io-client';

export const connectToMonitorSocket = server => {
  if (!server) {
    return null;
  }

  const socket = io.connect(`https://${server}`, {
    path: '/monitorSocket',
    transports: ['websocket'],
  });

  socket.on('connect', () => console.log(`Sucessfull connected to ${server}`));
  socket.on('connect_error', () => console.log(`Failed to connect on ${server}`));

  return socket;
};

export const disconnectFromMonitorSocket = socket => {
  if (!socket) {
    return null;
  }

  socket.on('disconnect', () => console.log(`Socket disconnected`));

  socket.disconnect();
  socket.close();

  return null;
};
