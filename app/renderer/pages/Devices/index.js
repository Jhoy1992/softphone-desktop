import React, { useState, useEffect, useContext } from 'react';

import { store } from '../../store';
import { addNotification } from '../../actions/notificationsActions';
import { toggleMenu } from '../../actions/menuActions';
import { saveDevices } from '../../actions/devicesActions';

import Header from '../../components/Header';
import Menu from '../../components/Menu';
import { Container, ListDevices, Controls } from './styles';

const Devices = ({ history }) => {
  const { dispatch, state } = useContext(store);
  const [devices, setDevices] = useState({});
  const [headphone, setHeadphone] = useState({ label: 'default', volume: 1 });
  const [speaker, setSpeaker] = useState({ label: 'default', volume: 1 });
  const [microphone, setMicrophone] = useState({ label: 'default' });

  useEffect(() => {
    const loadDevices = async () => {
      await listDevices();

      setHeadphone({ ...headphone, ...state.devices?.headphone });
      setSpeaker({ ...speaker, ...state.devices?.speaker });
      setMicrophone({ ...microphone, ...state.devices?.microphone });
    };

    loadDevices();
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

  const saveDevicesConfig = () => {
    localStorage.setItem('speaker', JSON.stringify(speaker));
    localStorage.setItem('headphone', JSON.stringify(headphone));
    localStorage.setItem('microphone', JSON.stringify(microphone));

    dispatch(saveDevices({ speaker, headphone, microphone }));

    dispatch(
      addNotification({
        message: 'Configurações salvas com sucesso!',
        type: 'success',
      }),
    );
  };

  const handleSelectHeadphone = event => {
    const { value } = event.target;

    const [{ deviceId = 'default' }] = devices.audioOutputs.filter(
      device => device.label === value,
    );

    setHeadphone({ ...headphone, deviceId, label: value });
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

    setSpeaker({ ...speaker, deviceId, label: value });
  };

  const handleNotificationsVolume = event => {
    const { value } = event.target;
    setSpeaker({ ...speaker, volume: Number(value) });
  };

  const handleSelectMicrophone = event => {
    const { value } = event.target;

    const [{ deviceId = 'default' }] = devices.audioInputs.filter(device => device.label === value);

    setMicrophone({ deviceId, label: value });
  };

  return (
    <>
      <Header title="Dispositivos" />
      <Menu />

      <Container onClick={() => dispatch(toggleMenu(false))}>
        <ListDevices>
          <label>Dispositivo de som:</label>
          <select value={headphone?.label} name="audioOutput" onChange={handleSelectHeadphone}>
            {devices?.audioOutputs?.map(device => (
              <option key={device.deviceId} value={device.label}>
                {device.label}
              </option>
            ))}
          </select>

          <label> Volume da chamada: </label>
          <input
            value={headphone?.volume}
            type="range"
            max="1"
            step="0.01"
            onChange={handleCallVolume}
          />

          <label>Dispositivo de notificação:</label>
          <select value={speaker?.label} name="audioOutput" onChange={handleSelectSpeaker}>
            {devices?.audioOutputs?.map(device => (
              <option key={device.deviceId} value={device.label}>
                {device.label}
              </option>
            ))}
          </select>

          <label> Volume da notificação: </label>
          <input
            value={speaker?.volume}
            type="range"
            max="1"
            step="0.01"
            onChange={handleNotificationsVolume}
          />

          <label>Microfone:</label>
          <select value={microphone?.label} name="audioOutput" onChange={handleSelectMicrophone}>
            {devices?.audioInputs?.map(device => (
              <option key={device.deviceId} value={device.label}>
                {device.label}
              </option>
            ))}
          </select>
        </ListDevices>

        <Controls>
          <button onClick={() => history.push('/')}>Voltar</button>
          <button onClick={saveDevicesConfig}>Salvar</button>
        </Controls>
      </Container>
    </>
  );
};

export default Devices;
