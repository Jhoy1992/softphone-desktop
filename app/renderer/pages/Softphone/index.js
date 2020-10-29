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
  FaTimes,
} from 'react-icons/fa';
import { BiWorld } from 'react-icons/bi';
import { MdCallMissed } from 'react-icons/md';

import api from '../../services/api';

import { store } from '../../store';
import { toggleMenu } from '../../actions/menuActions';
import { addNotification } from '../../actions/notificationsActions';

import useRefState from '../../hooks/useReferredState';
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
  LostCalls,
  PeerInfo,
  Lines,
  Line,
  DialNumber,
  Microphone,
  Erase,
  AnswerButton,
  HangupButton,
  Footer,
} from './styles';

const DIAL_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
const INITIAL_DATA = {
  callNumber: '',
  callStatus: '',
  caller: { number: '', name: '' },
  session: null,
  callTime: 0,
};

const Home = ({ history, location }) => {
  const { dispatch, state } = useContext(store);
  const { devices } = state;
  const [dialNumbers] = useState(DIAL_KEYS);
  const [lostCalls, lostCallsRef, setLostCalls] = useRefState(0);
  const [phoneStatus, phoneStatusRef, setPhoneStatus] = useRefState('');
  const [phone, phoneRef, setPhone] = useRefState(null);
  const [ringtone, setRingtone] = useState('');
  const ringAudio = useRef(new Audio());
  const remoteAudio = useRef(new Audio());
  const [currentLine, currentLineRef, setCurrentLine] = useRefState(0);
  const [lines, linesRef, setLines] = useRefState([
    { ...INITIAL_DATA },
    { ...INITIAL_DATA },
    { ...INITIAL_DATA },
    { ...INITIAL_DATA },
  ]);

  useEffect(() => {
    register();
    setCallSpeaker(devices?.speaker.deviceId);
    adjustVolumeLevels(devices);
    subscribeLostCalls(state.socket);
    loadLostCalls();
    changeLine(currentLine);

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

    linesRef.current.forEach((line, index) => clearSession(index, line.session));

    phoneRef.current.stop();
    phoneRef.current.removeAllListeners();
    phoneRef.current.unregister();

    setPhone(null);
  };

  const callRouteNumber = number => {
    if (!number) {
      return;
    }

    setCallNumber(currentLineRef.current, location.state.number);

    setTimeout(() => {
      if (phoneStatusRef.current === 'Registrado') {
        answerOrCall(currentLineRef.current, location.state?.number);
      }
    }, 500);
  };

  const subscribeLostCalls = socket => {
    if (!socket) {
      return;
    }

    socket.on('historyCallReceived', ({ destCallerIdNum, dialStatus }) => {
      if (destCallerIdNum != state.peer?.user || dialStatus === 'ANSWER') {
        return;
      }

      setLostCalls(lostCallsRef.current + 1);
    });
  };

  const loadLostCalls = async () => {
    if (!state.user?.user || !state.user?.pass || !state.user?.api) {
      return;
    }

    const { data } = await api.post(`https://${state.user.api}/api/token`, {
      username: state.user.user,
      password: state.user.pass,
    });

    api.defaults.headers['Authorization'] = `Bearer ${data.token}`;

    const { data: lostCalls } = await api.get(`https://${state.user.api}/api/historyCalls`, {
      params: {
        peerId: data.user.Peer.id,
        notify: true,
      },
    });

    setLostCalls(lostCalls.length);
  };

  const handleNewSession = newSession => {
    const isIncoming = newSession.direction === 'incoming';
    const lineIndex = getAvailableLine(isIncoming);

    if (isIncoming) {
      playRingtone();
    }

    newSession.on('ended', () => clearSession(lineIndex, newSession));
    newSession.on('failed', () => clearSession(lineIndex, newSession));
    newSession.on('accepted', () => updateUI(lineIndex, newSession));
    newSession.on('confirmed', () => updateUI(lineIndex, newSession));

    newSession.on('peerconnection', peer => {
      addTrack(lineIndex, newSession, peer.peerconnection);
    });

    updateUI(lineIndex, newSession);
    setSession(lineIndex, newSession);
  };

  const getAvailableLine = isIncoming => {
    if (!isIncoming || !linesRef.current[currentLineRef.current].session) {
      return currentLineRef.current;
    }

    for (const [index, line] of linesRef.current.entries()) {
      if (!line.session) {
        return index;
      }
    }
  };

  const addTrack = (lineIndex, session, connection) => {
    connection.ontrack = event => {
      linesRef.current[lineIndex].session.stream = event.streams[0];

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

  const updateUI = (lineIndex, session) => {
    if (session.isInProgress()) {
      const number = session.remote_identity.uri.user;
      const name = session.remote_identity.display_name;
      const isIncoming = session.direction === 'incoming';

      setCaller(lineIndex, { number, name });

      if (isIncoming) {
        setCallStatus(lineIndex, 'Recebendo ligação...');

        showCallNotification(
          lineIndex,
          'Nova ligação',
          `Ligação de ${number} <${name}>, clique para atender.`,
        );
      }

      if (!isIncoming) {
        setCallStatus(lineIndex, 'Discando...');
      }
    }

    if (session.isEstablished()) {
      setCallStatus(lineIndex, 'Em ligação...');
      startCallTimer(lineIndex);

      ringAudio.current.pause();
    }
  };

  const startCallTimer = lineIndex => {
    const line = getLineByIndex(lineIndex);

    if (line.callTimer) {
      return;
    }

    setCallTime(lineIndex, 0);
    setCallTimer(
      lineIndex,
      setInterval(() => setCallTime(lineIndex, line.callTime + 1), 1000),
    );
  };

  const stopCallTimer = lineIndex => {
    const line = getLineByIndex(lineIndex);

    if (line.callTimer) {
      return;
    }

    clearInterval(line.callTimer);
    setCallTime(lineIndex, 0);
  };

  const clearSession = (lineIndex, session) => {
    if (linesRef.current[lineIndex].notification) {
      linesRef.current[lineIndex].notification.close();
      setNotification(lineIndex, null);
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

    stopCallTimer(lineIndex);
    setCallStatus(lineIndex, '');
    setCaller(lineIndex, { number: '', name: '' });
    setCallTime(lineIndex, 0);
    setSession(lineIndex, null);
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

  const answerOrCall = (lineIndex, callNumber) => {
    const line = getLineByIndex(lineIndex);

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

    if (line.session?.isEstablished()) {
      clearSession(lineIndex, line.session);
      return;
    }

    if (line.session?.isInProgress()) {
      if (line.session?.direction === 'outgoing') {
        clearSession(lineIndex, line.session);
        return;
      }

      if (line.session?.isInProgress()) {
        line.session.answer(callOptions);

        return;
      }
    }

    if (!line.callNumber?.length && !callNumber) {
      return;
    }

    const newSession = phoneRef.current.call(
      `sip:${callNumber || linesRef.current[lineIndex].callNumber}@localhost`,
      callOptions,
    );

    addTrack(lineIndex, newSession, newSession.connection);
  };

  const mute = lineIndex => {
    const line = getLineByIndex(lineIndex);

    if (!line.session?.isEstablished()) {
      return;
    }

    if (line.session.isMuted().audio) {
      line.session.unmute({ audio: true });
    } else {
      line.session.mute({ audio: true });
    }
  };

  const toogleHold = lineIndex => {
    const line = getLineByIndex(lineIndex);

    if (!line.session?.isEstablished()) {
      return;
    }

    if (!line.session?.isOnHold().local) {
      line.session?.hold();
    } else {
      line.session?.unhold();
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
    const lineIndex = currentLineRef.current;
    const line = getLineByIndex(lineIndex);

    if (event.key === 'm') {
      mute(lineIndex);
      return;
    }

    if (event.keyCode === 13) {
      answerOrCall(lineIndex);
      return;
    }

    if (event.keyCode === 8) {
      setCallNumber(lineIndex, line.callNumber.slice(0, -1));
      return;
    }

    if (!DIAL_KEYS.includes(event.key)) {
      return;
    }

    if (!event.repeat) {
      playTone(event.key);
    }

    if (line.session?.isEstablished()) {
      line.session.sendDTMF(event.key);
      return;
    }

    if (line.callNumber.length >= 16) return;

    setCallNumber(lineIndex, line.callNumber + event.key);
  };

  const showCallNotification = (lineIndex, title, message) => {
    const currentWindow = remote.getCurrentWindow();

    if (currentWindow.isFocused()) {
      return;
    }

    const newNotification = new remote.Notification({
      title,
      body: message,
    });

    newNotification.on('click', () => {
      if (linesRef.current[lineIndex].session?.isInProgress()) {
        answerOrCall(lineIndex);
      }
    });

    newNotification.show();
    setNotification(lineIndex, newNotification);
  };

  const changeLine = lineIndex => {
    if (currentLineRef.current === lineIndex) {
      return;
    }

    toogleHold(currentLineRef.current);
    toogleHold(lineIndex);

    setCurrentLine(lineIndex);
  };

  const getLineByIndex = lineIndex => {
    return linesRef.current[lineIndex];
  };

  const getLineStatus = lineIndex => {
    const line = getLineByIndex(lineIndex);

    if (line.session?.isInProgress()) {
      return { color: '#fff', background: '#ffb300', border: '#ffb300' };
    }

    if (line.session?.isOnHold().local) {
      return { color: '#fff', background: '#fa6a4d', border: '#fa6a4d' };
    }

    if (line.session?.isEstablished()) {
      return { color: '#fff', background: '#5cb85c', border: '#5cb85c' };
    }

    if (lineIndex === currentLineRef.current) {
      return { color: '#fff', background: '#6c757d', border: '#6c757d' };
    }

    return { color: '#6c757d', background: '#fff', border: '#dee2e6' };
  };

  const setCallNumber = (lineIndex, callNumber) => {
    const newLines = [...lines];

    newLines[lineIndex].callNumber = callNumber;
    setLines(newLines);
  };

  const setCaller = (lineIndex, caller) => {
    const newLines = [...lines];

    newLines[lineIndex].caller = { ...newLines[lineIndex].caller, ...caller };
    setLines(newLines);
  };

  const setCallStatus = (lineIndex, status) => {
    const newLines = [...lines];

    newLines[lineIndex].callStatus = status;
    setLines(newLines);
  };

  const setCallTime = (lineIndex, callTime) => {
    const newLines = [...lines];

    newLines[lineIndex].callTime = callTime;
    setLines(newLines);
  };

  const setCallTimer = (lineIndex, timer) => {
    const newLines = [...lines];

    newLines[lineIndex].callTimer = timer;
    setLines(newLines);
  };

  const setSession = (lineIndex, session) => {
    const newLines = [...lines];

    newLines[lineIndex].session = session;
    setLines(newLines);
  };

  const setNotification = (lineIndex, notification) => {
    const newLines = [...lines];

    newLines[lineIndex].notification = notification;
    setLines(newLines);
  };

  const openExternalUrl = event => {
    event.preventDefault();
    remote.shell.openExternal('http://www.nativeip.com.br');
  };

  return (
    <>
      <Header />
      <Menu />

      <Container onClick={() => dispatch(toggleMenu(false))}>
        <Display>
          {lines[currentLine].session && (
            <Duration>
              {lines[currentLine].session?.start_time && (
                <div>
                  Início:{' '}
                  {new Date(lines[currentLine].session.start_time).toLocaleTimeString('pt-BR')}
                </div>
              )}

              {!!lines[currentLine].callTime && (
                <div>Tempo: {secondsToHms(lines[currentLine].callTime)}</div>
              )}
            </Duration>
          )}

          <Divisor />

          {lostCalls > 0 && (
            <LostCalls onClick={() => history.push('/history')}>
              <MdCallMissed size={16} /> {lostCalls} chamada{lostCalls === 1 ? '' : 's'} perdidas
            </LostCalls>
          )}

          {!lines[currentLine].session && <CallNumber>{lines[currentLine].callNumber}</CallNumber>}

          {lines[currentLine].session && (
            <CallerInfo>
              <h3>{lines[currentLine].callStatus}</h3>

              {!!lines[currentLine].caller?.number && (
                <h1>
                  {lines[currentLine].caller.number}
                  {lines[currentLine].caller?.name && <> - {lines[currentLine].caller.name}</>}
                </h1>
              )}
            </CallerInfo>
          )}

          <PeerInfo>
            <div>
              <FaPhoneAlt size={6} />
              {state?.peer?.user}
            </div>

            <div>{phoneStatus}</div>
          </PeerInfo>
        </Display>

        <Lines>
          {lines.map((line, index) => {
            const { color, background, border } = getLineStatus(index);

            return (
              <Line
                key={index}
                background={background}
                color={color}
                border={border}
                onClick={() => changeLine(index)}>
                <FaPhoneAlt size={8} /> {index + 1}
              </Line>
            );
          })}
        </Lines>

        <DialPad>
          {dialNumbers.map(dialNumber => (
            <DialNumber key={dialNumber} onClick={() => padClick(dialNumber)}>
              {dialNumber}
            </DialNumber>
          ))}

          <Microphone
            disabled={!lines[currentLine].session?.isEstablished()}
            onClick={() => mute(currentLine)}>
            {lines[currentLine].session?.isMuted().audio ? (
              <FaMicrophoneSlash size={30} />
            ) : (
              <FaMicrophone />
            )}
          </Microphone>

          {lines[currentLine].session ? (
            <HangupButton onClick={() => clearSession(currentLine, lines[currentLine].session)}>
              <FaPhoneSlash color="#dc3545" size={30} />
            </HangupButton>
          ) : (
            <Erase onClick={() => padClick(null, 8)}>
              <FaBackspace size={30} />
            </Erase>
          )}

          <AnswerButton
            onClick={() => answerOrCall(currentLine)}
            disabled={
              !phone?.isRegistered() ||
              lines[currentLine].session?.isEstablished() ||
              (lines[currentLine].session?.isInProgress() &&
                lines[currentLine].session?.direction !== 'incoming')
            }>
            <FaPhone color="#389400" />
          </AnswerButton>
        </DialPad>

        <Footer onClick={openExternalUrl}>
          Copyright © 2020 Native IP
          <BiWorld size={12} />
        </Footer>

        <audio ref={ringAudio} src={ringtone} />
        <audio ref={remoteAudio} />
      </Container>
    </>
  );
};

export default Home;
