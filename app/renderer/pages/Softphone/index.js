import React, { useState, useEffect, useRef, useContext } from 'react';
import { remote } from 'electron';
import * as JsSIP from 'jssip';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaBackspace,
  FaPhone,
  FaPhoneSlash,
  FaPhoneAlt,
} from 'react-icons/fa';

import { store } from '../../store';
import { toggleMenu } from '../../actions/menuActions';
import { addNotification } from '../../actions/notificationsActions';

import useRefferedState from '../../hooks/useReferredState';
import PlayTone from '../../utils/tones';
import secondsToHms from '../../utils/secondsToHms';

import Header from '../../components/Header';
import Menu from '../../components/Menu';

import {
  Container,
  Display,
  DialPad,
  Duration,
  Divisor,
  CallNumber,
  CallerInfo,
  PeerInfo,
  DialNumber,
  Microphone,
  Erase,
  AnswerButton,
  HangupButton,
} from './styles';

const DIAL_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

const Home = ({ history, location }) => {
  const { dispatch, state } = useContext(store);
  const { devices } = state;
  const [dialNumbers] = useState(DIAL_KEYS);
  const [callNumber, callNumberRef, setCallNumber] = useRefferedState('');
  const [phoneStatus, phoneStatusRef, setPhoneStatus] = useRefferedState('');
  const [callStatus, setCallStatus] = useState('');
  const [caller, setCaller] = useState({ number: '', name: '' });
  const [callTime, setCallTime] = useState(0);
  const [phone, phoneRef, setPhone] = useRefferedState(null);
  const [session, sessionRef, setSession] = useRefferedState(null);
  const [ringtone, setRingtone] = useState('');
  const [notification, notificationRef, setNotification] = useRefferedState(null);
  const ringAudio = useRef(new Audio());
  const remoteAudio = useRef(new Audio());

  useEffect(() => {
    register();
    setCallSpeaker(devices?.speaker.deviceId);
    adjustVolumeLevels(devices);
    callRouteNumber(location.state?.number);

    return unregister;
  }, []);

  const register = () => {
    JsSIP.debug.disable();
    document.addEventListener('keydown', getkeys);

    if (!state?.peer.server || !state?.peer.pass || !state?.peer.user) {
      dispatch(addNotification({ message: 'Preencha os dados do ramal', type: 'info' }));
      history.push('/user');
      return;
    }

    const sip = {
      host: `wss://${state?.peer.server}/ws`,
      password: state?.peer.pass,
      uri: `sip:${state?.peer.user}@${state.peer.server}`,
    };

    const socket = new JsSIP.WebSocketInterface(sip.host);

    const configuration = {
      sockets: [socket],
      uri: sip.uri,
      password: sip.password,
    };

    const newPhone = new JsSIP.UA(configuration);

    newPhone.on('connecting', () => setPhoneStatus('Conectando...'));
    newPhone.on('connected', () => setPhoneStatus('Conectado'));
    newPhone.on('disconnected', () => setPhoneStatus('Desconectado'));
    newPhone.on('registered', () => setPhoneStatus('Registrado'));
    newPhone.on('unregistered', () => setPhoneStatus('Sem registro'));
    newPhone.on('registrationFailed', () => setPhoneStatus('Falha de registro'));
    newPhone.on('newRTCSession', event => handleNewSession(event.session));

    newPhone.start();
    setPhone(newPhone);
  };

  const unregister = () => {
    document.removeEventListener('keydown', getkeys);

    if (!phoneRef.current) {
      return;
    }

    clearSession(sessionRef.current);

    phoneRef.current.stop();
    phoneRef.current.removeAllListeners();
    phoneRef.current.unregister();

    setPhone(null);
  };

  const callRouteNumber = number => {
    if (!number) {
      return;
    }

    setCallNumber(location.state.number);

    setTimeout(() => {
      if (phoneStatusRef.current === 'Registrado') {
        answerOrCall(location.state?.number);
      }
    }, 500);
  };

  const handleNewSession = newSession => {
    const isIncoming = newSession.direction === 'incoming';

    if (isIncoming) {
      playRingtone();
    }

    newSession.on('ended', () => clearSession(newSession));
    newSession.on('failed', () => clearSession(newSession));
    newSession.on('accepted', () => updateUI(newSession));
    newSession.on('confirmed', () => updateUI(newSession));

    newSession.on('peerconnection', peer => {
      addTrack(newSession, peer.peerconnection);
    });

    updateUI(newSession);
    setSession(newSession);
  };

  const addTrack = (session, connection) => {
    connection.ontrack = event => {
      session.stream = event.streams[0];

      setTrack(session.stream);
    };
  };

  const setTrack = stream => {
    if (!stream) {
      return;
    }

    if (stream.getAudioTracks()[0]) {
      setCallHeadphone(devices?.headphone?.deviceId);
      remoteAudio.current.srcObject = stream;
      remoteAudio.current.play();
    }
  };

  const updateUI = session => {
    if (session.isInProgress()) {
      const number = session.remote_identity.uri.user;
      const name = session.remote_identity.display_name;
      const isIncoming = session.direction === 'incoming';

      setCaller({ ...caller, number, name });

      if (isIncoming) {
        setCallStatus('Recebendo ligação...');
        showCallNotification(
          'Nova ligação',
          `Ligação de ${number} <${name}>, clique para atender.`,
        );
      }

      if (!isIncoming) {
        setCallStatus('Discando...');
      }
    }

    if (session.isEstablished()) {
      setCallStatus('Em ligação...');
      startCallTimer(session);

      ringAudio.current.pause();
    }
  };

  const startCallTimer = session => {
    if (session.callTimer) {
      return;
    }

    session.callTime = 0;

    session.callTimer = setInterval(() => {
      session.callTime += 1;
      setCallTime(session.callTime);
    }, 1000);
  };

  const stopCallTimer = session => {
    if (!session?.callTimer) {
      return;
    }

    clearInterval(session.callTimer);
    setCallTime(0);
  };

  const clearSession = session => {
    if (notificationRef.current) {
      notificationRef.current.close();
      setNotification(null);
    }

    if (session?.isEstablished() || session?.isInProgress()) {
      session.terminate();
    }

    if (ringAudio) {
      ringAudio.current.pause();
    }

    if (remoteAudio) {
      remoteAudio.current.pause();
      remoteAudio.current.srcObject = null;
    }

    stopCallTimer(session);
    setCallStatus('');
    setCaller({ number: '', name: '' });
    setCallTime(0);
    setSession(null);
  };

  const playRingtone = () => {
    setRingtone('assets/ring01.mp3');

    ringAudio.current.loop = true;
    ringAudio.current.volume = devices?.speaker?.volume || 1;
    ringAudio.current.load();
    ringAudio.current.play();
  };

  const playTone = key => {
    const tones = [
      [697.0, 1209.0],
      [697.0, 1336.0],
      [697.0, 1477.0],
      [770.0, 1209.0],
      [770.0, 1336.0],
      [770.0, 1477.0],
      [852.0, 1209.0],
      [852.0, 1336.0],
      [852.0, 1477.0],
      [941.0, 1209.0],
      [941.0, 1336.0],
      [941.0, 1477.0],
    ];

    const [frequency1, frequency2] = tones[DIAL_KEYS.indexOf(key)];

    PlayTone(frequency1, frequency2, devices?.speaker?.volume);
  };

  const answerOrCall = callNumber => {
    const callOptions = {
      mediaConstraints: {
        audio: {
          deviceId: {
            exact: devices?.microphone?.deviceId || 'default',
          },
        },
        video: false,
        pcConfig: {
          iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
        },
      },
    };

    if (!phoneRef.current?.isRegistered()) {
      return;
    }

    if (sessionRef.current?.isEstablished()) {
      clearSession(sessionRef.current);
      return;
    }

    if (sessionRef.current?.isInProgress()) {
      if (sessionRef.current?.direction === 'outgoing') {
        clearSession(sessionRef.current);
        return;
      }

      if (sessionRef.current?.isInProgress()) {
        sessionRef.current.answer(callOptions);

        return;
      }
    }

    const newSession = phoneRef.current.call(
      `sip:${callNumber || callNumberRef.current}@localhost`,
      callOptions,
    );

    addTrack(newSession, newSession.connection);
  };

  const mute = () => {
    if (!sessionRef.current?.isEstablished()) return;

    if (sessionRef.current.isMuted().audio) {
      sessionRef.current.unmute({ audio: true });
    } else {
      sessionRef.current.mute({ audio: true });
    }
  };

  const hold = () => {
    if (!sessionRef.current || !sessionRef.current.isEstablished()) {
      return;
    }

    if (!sessionRef.current.isOnHold().local) {
      sessionRef.current.hold();
    } else {
      sessionRef.current.unhold();
    }
  };

  const setCallHeadphone = (headphone = 'default') => {
    remoteAudio.current.setSinkId(headphone);
  };

  const setCallSpeaker = (speaker = 'default') => {
    ringAudio.current.setSinkId(speaker);
  };

  const adjustVolumeLevels = devices => {
    if (!devices) {
      return;
    }

    const { speaker, headphone } = devices;

    if (speaker?.volume) {
      ringAudio.current.volume = speaker?.volume;
    }

    if (headphone?.volume) {
      remoteAudio.current.volume = headphone?.volume;
    }
  };

  const padClick = (number, code = null) => {
    const event = { key: number, keyCode: code };
    getkeys(event);
  };

  const getkeys = event => {
    if (event.key === 'm') {
      mute();
      return;
    }

    if (event.keyCode === 13) {
      answerOrCall();
      return;
    }

    if (event.keyCode === 8) {
      setCallNumber(callNumberRef.current.slice(0, -1));
      return;
    }

    if (!DIAL_KEYS.includes(event.key)) {
      return;
    }

    if (!event.repeat) {
      playTone(event.key);
    }

    if (session?.isEstablished()) {
      session.sendDTMF(event.key);
      return;
    }

    if (callNumberRef.current.length >= 16) return;

    setCallNumber(callNumberRef.current + event.key);
  };

  const showCallNotification = (title, message) => {
    const currentWindow = remote.getCurrentWindow();

    if (currentWindow.isFocused()) {
      return;
    }

    const newNotification = new remote.Notification({
      title,
      body: message,
    });

    newNotification.on('click', () => {
      if (sessionRef?.current?.isInProgress()) {
        answerOrCall();
      }
    });

    newNotification.show();
    setNotification(newNotification);
  };

  return (
    <>
      <Header />
      <Menu />

      <Container onClick={() => dispatch(toggleMenu(false))}>
        <Display>
          {session && (
            <Duration>
              {session?.start_time && (
                <div>Início: {new Date(session.start_time).toLocaleTimeString('pt-BR')}</div>
              )}

              {!!callTime && <div>Tempo: {secondsToHms(callTime)}</div>}
            </Duration>
          )}

          <Divisor />

          {!session && <CallNumber>{callNumber}</CallNumber>}

          {session && (
            <CallerInfo>
              <h3>{callStatus}</h3>

              {!!caller?.number && (
                <h1>
                  {caller.number} {caller?.name && <> - {caller.name}</>}
                </h1>
              )}
            </CallerInfo>
          )}

          <PeerInfo>
            <div>
              <FaPhoneAlt size={6} /> 100
            </div>
            <div>{phoneStatus}</div>
          </PeerInfo>
        </Display>

        <DialPad>
          {dialNumbers.map(dialNumber => (
            <DialNumber key={dialNumber} onClick={() => padClick(dialNumber)}>
              {dialNumber}
            </DialNumber>
          ))}

          <Microphone disabled={!session?.isEstablished()} onClick={mute}>
            {session?.isMuted().audio ? <FaMicrophoneSlash size={30} /> : <FaMicrophone />}
          </Microphone>

          {session ? (
            <HangupButton onClick={() => clearSession(session)}>
              <FaPhoneSlash color="#dc3545" size={30} />
            </HangupButton>
          ) : (
            <Erase onClick={() => padClick(null, 8)}>
              <FaBackspace size={30} />
            </Erase>
          )}

          <AnswerButton
            onClick={answerOrCall}
            disabled={
              !phone?.isRegistered() ||
              session?.isEstablished() ||
              (session?.isInProgress() && session?.direction !== 'incoming')
            }>
            <FaPhone color="#389400" />
          </AnswerButton>
        </DialPad>

        <audio ref={ringAudio} src={ringtone} />
        <audio ref={remoteAudio} />
      </Container>
    </>
  );
};

export default Home;
