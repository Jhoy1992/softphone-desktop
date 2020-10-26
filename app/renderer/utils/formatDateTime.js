const formatDateTime = date => {
  const options = {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  return new Intl.DateTimeFormat('pt-BR', options).format(date);
};

export default formatDateTime;
