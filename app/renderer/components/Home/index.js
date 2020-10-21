import React, { useState, useEffect, useRef } from 'react';
import * as JsSIP from 'jssip';

import useRefferedState from '../../hooks/useReferredState';
import PlayTone from '../../utils/tones';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaBackspace,
  FaPhone,
  FaPhoneSlash,
  FaPhoneAlt,
} from 'react-icons/fa';

import Header from '../../components/Header';
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

const Home = ({ history }) => {
  const [dialNumbers] = useState(DIAL_KEYS);
  const [callNumber, callNumberRef, setCallNumber] = useRefferedState('');
  const [phoneStatus, setPhoneStatus] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [caller, setCaller] = useState({ number: '', name: '' });
  const [callTime, setCallTime] = useState(0);
  const [phone, phoneRef, setPhone] = useRefferedState(null);
  const [session, sessionRef, setSession] = useRefferedState(null);
  const [ringtone, setRingtone] = useState('');
  const ringAudio = useRef(new Audio());
  const remoteAudio = useRef(new Audio());

  useEffect(() => {
    register();

    console.log(localStorage.getItem('speaker'));

    return unregister;
  }, []);

  const register = () => {
    JsSIP.debug.disable();
    document.addEventListener('keydown', getkeys);

    const sip = {
      host: 'wss://localhost/ws',
      password: 'Native.100',
      uri: 'sip:100@localhost',
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
    newPhone.on('disconnected', () => setPhoneStatus('Disconectado'));
    newPhone.on('registered', () => setPhoneStatus('Registrado'));
    newPhone.on('unregistered', () => setPhoneStatus('Sem registro'));
    newPhone.on('registrationFailed', () => setPhoneStatus('Falha de registro'));
    newPhone.on('newRTCSession', event => handleNewSession(event.session));

    newPhone.start();
    setPhone(newPhone);
  };

  const unregister = () => {
    // document.removeEventListener('keydown');

    if (!phone) {
      return;
    }

    clearSession();
    phone.unregister();
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
      setCallHeadphone('default');
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
    if (!session.callTimer) {
      return;
    }

    clearInterval(session.callTimer);
    setCallTime(0);
  };

  const clearSession = session => {
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

    PlayTone(frequency1, frequency2);
  };

  const answerOrCall = () => {
    const callOptions = {
      mediaConstraints: {
        audio: true,
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

    const newSession = phoneRef.current.call(`sip:${callNumberRef.current}@localhost`, callOptions);
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

  const setCallHeadphone = ({ headphone = 'default' }) => {
    if (headphone) {
      remoteAudio.current.setSinkId(headphone);
    }
  };

  const setCallSpeaker = ({ speaker = 'default' }) => {
    if (speaker) {
      ringAudio.current.setSinkId(speaker);
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

  const secondsToHms = seconds => {
    const days = Math.floor(seconds / 86400);
    const remainderSeconds = seconds % 86400;
    const hms = new Date(remainderSeconds * 1000).toISOString().substring(11, 19);
    return hms.replace(/^(\d+)/, h => `${Number(h) + days * 24}`.padStart(2, '0'));
  };

  return (
    <>
      <Header />
      <Container>
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
            <HangupButton>
              <FaPhoneSlash color="#dc3545" size={30} onClick={() => clearSession(session)} />
            </HangupButton>
          ) : (
            <Erase>
              <FaBackspace size={30} onClick={() => padClick(null, 8)} />
            </Erase>
          )}

          <AnswerButton
            disabled={
              !phone?.isRegistered() ||
              session?.isEstablished() ||
              (session?.isInProgress() && session?.direction !== 'incoming')
            }>
            <FaPhone color="#389400" onClick={answerOrCall} />
          </AnswerButton>
        </DialPad>

        <audio ref={ringAudio} src={ringtone} />
        <audio ref={remoteAudio} />
      </Container>
    </>
  );
};

export default Home;
