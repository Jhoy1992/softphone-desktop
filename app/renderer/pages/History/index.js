import React, { useState, useEffect, useContext, useRef } from 'react';
import ReactLoading from 'react-loading';
import { FiPhoneIncoming, FiPhoneOutgoing, FiPhoneMissed, FiClock, FiSearch } from 'react-icons/fi';

import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import { store } from '../../store';
import { addNotification } from '../../actions/notificationsActions';
import { toggleTooltip } from '../../actions/tooltipActions';
import { toggleMenu } from '../../actions/menuActions';

import Header from '../../components/Header';
import Menu from '../../components/Menu';

import formatDateTime from '../../utils/formatDateTime';
import { Container, Search, Loading, Calls, Call, Controls } from './styles';

const status = {
  OUT: <FiPhoneOutgoing color="#007bff" size={12} />,
  ANSWER: <FiPhoneIncoming color="#5cb85c" size={12} />,
  NOANSWER: <FiPhoneMissed color="#d9534f" size={12} />,
};

const History = ({ history }) => {
  const callsEndRef = useRef(null);
  const { dispatch, state } = useContext(store);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    loadHistory(1);
  }, []);

  useEffect(() => {
    const searchHistory = async () => {
      if (!debouncedSearchTerm) {
        if (!loading) {
          await loadHistory(1, true);
        }

        return;
      }

      setLoading(true);

      const { data } = await api.post(`https://${state.user.api}/api/token`, {
        username: state.user.user,
        password: state.user.pass,
      });

      api.defaults.headers['Authorization'] = `Bearer ${data.token}`;

      const { data: newCalls } = await api.get(`https://${state.user.api}/api/historyCalls`, {
        params: {
          peerId: data.user.Peer.id,
          limit: 50,
          $or: {
            name: [{ $like: `%${debouncedSearchTerm}%` }],
            phone: [{ $like: `%${debouncedSearchTerm}%` }],
          },
        },
      });

      setCalls(newCalls);
      setLoading(false);
    };

    searchHistory();
  }, [debouncedSearchTerm]);

  const loadHistory = async (page, replace = false) => {
    if (!state.user?.user || !state.user?.pass || !state.user?.api) {
      dispatch(addNotification({ message: 'Configure dados do Native', type: 'info' }));
      history.push('/user');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post(`https://${state.user.api}/api/token`, {
        username: state.user.user,
        password: state.user.pass,
      });

      api.defaults.headers['Authorization'] = `Bearer ${data.token}`;

      const { data: newCalls } = await api.get(`https://${state.user.api}/api/historyCalls`, {
        params: {
          peerId: data.user.Peer.id,
          limit: 20,
          page,
        },
      });

      replace ? setCalls(newCalls) : setCalls([...calls, ...newCalls]);
      setPage(page);
      setLoading(false);

      if (page > 1) {
        scrollToBottom();
      }
    } catch (error) {
      dispatch(addNotification({ message: 'Erro ao buscar os dados do histórico', type: 'error' }));
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (callsEndRef.current) {
      callsEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  };

  const callNumber = number => {
    hideTooltip();

    history.push({
      pathname: '/',
      state: { number },
    });
  };

  const showTooltip = (event, message) => {
    const { left, bottom } = event.currentTarget.getBoundingClientRect();

    const position = {
      left: left + 5,
      top: bottom + 5,
    };

    dispatch(toggleTooltip({ message: 'Clique para chamar', position }));
  };

  const hideTooltip = () => {
    dispatch(toggleTooltip({}));
  };

  return (
    <>
      <Header title="Histórico" />
      <Menu />
      <Container onClick={() => dispatch(toggleMenu(false))}>
        <Search>
          <input
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            type="text"
            placeholder="Pesquisar..."
          />
          <FiSearch size={26} />
        </Search>

        {loading ? (
          <Loading>
            <p>BUSCANDO INFORMAÇÕES</p>
            <ReactLoading type="bars" color="#bbb" height={64} width={64} />
          </Loading>
        ) : (
          <>
            <Calls>
              {calls.map(call => (
                <Call
                  key={call.id}
                  onClick={() => callNumber(call.phone)}
                  onMouseEnter={event => showTooltip(event, 'Esse é um teste de tooltip')}
                  onMouseLeave={hideTooltip}>
                  <div>
                    <div>
                      <FiClock size={12} data-tip="hello world" />
                      {formatDateTime(new Date(call.startTime))}
                    </div>

                    {status[call.status]}
                  </div>

                  <div>
                    <span>
                      <strong>{call.phone} </strong>
                      {`<${call.name}>`}
                    </span>
                  </div>
                </Call>
              ))}

              {!debouncedSearchTerm && (
                <p ref={callsEndRef} onClick={() => loadHistory(page + 1)}>
                  Carregar mais antigos...
                </p>
              )}
            </Calls>
          </>
        )}

        <Controls>
          <button onClick={() => history.push('/')}>Voltar</button>
        </Controls>
      </Container>
    </>
  );
};

export default History;
