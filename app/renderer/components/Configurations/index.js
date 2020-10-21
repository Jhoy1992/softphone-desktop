import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';
import { Container, Devices, Controls } from './styles';

const Configurations = ({ history }) => {
  const [devices, setDevices] = useState({});
  const [headphone, setHeadphone] = useState({ id: 'default', volume: 1 });
  const [speaker, setSpeaker] = useState({ id: 'default', volume: 1 });
  const [microphone, setMicrophone] = useState('default');

  useEffect(() => {
    listDevices();
  }, []);

  const listDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(device => device.kind == 'audioinput');
    const audioOutputs = devices.filter(device => device.kind == 'audiooutput');

    audioInputs.map((device, index) => (device.label ? device.label : `Microfone ${index}`));
    audioOutputs.map((device, index) => (device.label ? device.label : `Saída de áudio ${index}`));

    navigator.mediaDevices.ondevicechange = listDevices;

    setDevices({ audioInputs, audioOutputs });
  };

  const saveConfigurations = () => {
    localStorage.setItem('speaker', JSON.stringify(speaker));
    localStorage.setItem('headphone', JSON.stringify(headphone));
    localStorage.setItem('microphone', microphone);

    toast('Configurações salvas!');
  };

  const handleSelectHeadphone = event => {
    const { value } = event.target;

    const [{ deviceId = 'default' }] = devices.audioOutputs.filter(
      device => device.label === value,
    );

    setHeadphone({ ...headphone, id: deviceId });
  };

  const handleCallVolume = event => {
    const { value } = event.target;
    setHeadphone({ ...headphone, volume: Number(value) });
  };

  const handleSelectSpeaker = event => {
    const { value } = event.target;

    const [{ deviceId = 'default' }] = devices.audioOutputs.filter(
      device => device.label === value,
    );

    setSpeaker({ ...speaker, id: deviceId });
  };

  const handleNotificationsVolume = event => {
    const { value } = event.target;
    setSpeaker({ ...speaker, volume: Number(value) });
  };

  const handleSelectMicrophone = event => {
    const { value } = event.target;

    const [{ deviceId = 'default' }] = devices.audioInputs.filter(device => device.label === value);

    setMicrophone(deviceId);
  };

  return (
    <>
      <Header title="Configurações" />

      <Container>
        <Devices>
          <label>Dispositivo de som:</label>
          <select name="audioOutput" onChange={handleSelectHeadphone}>
            {devices?.audioOutputs?.map(device => (
              <option key={device.deviceId} value={device.id}>
                {device.label}
              </option>
            ))}
          </select>

          <label> Volume da chamada: </label>
          <input type="range" min="0" max="1" step="0.01" onChange={handleCallVolume} />

          <label>Dispositivo de notificação:</label>
          <select name="audioOutput" onChange={handleSelectSpeaker}>
            {devices?.audioOutputs?.map(device => (
              <option key={device.label} value={device.id}>
                {device.label}
              </option>
            ))}
          </select>

          <label> Volume da notificação: </label>
          <input type="range" min="0" max="1" step="0.01" onChange={handleNotificationsVolume} />

          <label>Microfone:</label>
          <select name="audioOutput" onChange={handleSelectMicrophone}>
            {devices?.audioInputs?.map(device => (
              <option key={device.label} value={device.id}>
                {device.label}
              </option>
            ))}
          </select>
        </Devices>

        <Controls>
          <button onClick={() => history.goBack()}>Voltar</button>
          <button onClick={saveConfigurations}>Salvar</button>
        </Controls>
      </Container>
    </>
  );
};

export default Configurations;
