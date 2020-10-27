import React, { useState, useEffect, useContext } from 'react';
import ReactLoading from 'react-loading';

import api from '../../services/api';
import { store } from '../../store';
import { addNotification } from '../../actions/notificationsActions';
import { toggleMenu } from '../../actions/menuActions';
import { saveUser } from '../../actions/userActions';
import { savePeer } from '../../actions/peerActions';

import Header from '../../components/Header';
import Menu from '../../components/Menu';
import { Container, Loading, Native, Asterisk, Controls } from './styles';

const User = ({ history }) => {
  const { dispatch, state } = useContext(store);
  const [user, setUser] = useState({ api: '', user: '', pass: '' });
  const [peer, setPeer] = useState({ server: '', user: '', pass: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser({ ...user, ...state?.user });
    setPeer({ ...peer, ...state?.peer });
  }, []);

  const saveUserConfig = () => {
    if (!peer.server || !peer.user || !peer.pass) {
      dispatch(addNotification({ message: 'Preencha os dados do ramal', type: 'error' }));
      return;
    }

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('peer', JSON.stringify(peer));
    dispatch(saveUser(user));
    dispatch(savePeer(peer));

    dispatch(addNotification({ message: 'Configuração salva com sucesso', type: 'success' }));
    history.push('/');
  };

  const loadPeerConfig = async () => {
    setLoading(true);

    try {
      const { data } = await api.post(`https://${user.api}/api/token`, {
        username: user.user,
        password: user.pass,
      });

      const { Peer = {} } = data?.user;
      const newPeer = { user: Peer?.username, pass: Peer?.secret };
      setPeer({ ...peer, ...newPeer });

      dispatch(addNotification({ message: 'Informações do ramal carregadas', type: 'success' }));
      setLoading(false);
    } catch (error) {
      dispatch(addNotification({ message: 'Erro ao buscar informações do ramal', type: 'error' }));
      setLoading(false);
    }
  };

  const handleChangeUserUsername = event => {
    setUser({ ...user, user: event.target.value });
  };

  const handleChangeUserPass = event => {
    setUser({ ...user, pass: event.target.value });
  };

  const handleChangeUserApi = event => {
    setUser({ ...user, api: event.target.value });
  };

  const handleChangePeerUser = event => {
    setPeer({ ...peer, user: event.target.value });
  };

  const handleChangePeerPass = event => {
    setPeer({ ...peer, pass: event.target.value });
  };

  const handleChangePeerServer = event => {
    setPeer({ ...peer, server: event.target.value });
  };

  return (
    <>
      <Header title="Usuário" />
      <Menu />

      <Container onClick={() => dispatch(toggleMenu(false))}>
        {loading ? (
          <Loading>
            <p>BUSCANDO INFORMAÇÕES</p>
            <ReactLoading type="bars" color="#bbb" height={64} width={64} />
          </Loading>
        ) : (
          <Native>
            <strong>Configuração Automática</strong>
            <hr />
            <label>Endereço da api do Native:</label>
            <input
              value={user.api}
              onChange={handleChangeUserApi}
              type="text"
              placeholder="localhost"
            />

            <div>
              <div>
                <label>Usuário:</label>
                <input
                  value={user.user}
                  onChange={handleChangeUserUsername}
                  type="text"
                  placeholder="Seu usuário"
                />
              </div>

              <div>
                <label>Senha:</label>
                <input
                  value={user.pass}
                  onChange={handleChangeUserPass}
                  type="password"
                  placeholder="Sua senha"
                />
              </div>
            </div>

            <button onClick={loadPeerConfig}>Carregar Configurações</button>
          </Native>
        )}

        <Asterisk>
          <strong>Configurações do Ramal</strong>
          <hr />
          <label>Endereço do servidor:</label>
          <input
            value={peer.server}
            onChange={handleChangePeerServer}
            type="text"
            placeholder="localhost"
          />

          <div>
            <div>
              <label>Usuário:</label>
              <input
                value={peer.user}
                onChange={handleChangePeerUser}
                type="text"
                placeholder="Seu usuário"
              />
            </div>

            <div>
              <label>Senha:</label>
              <input
                value={peer.pass}
                onChange={handleChangePeerPass}
                type="password"
                placeholder="Sua senha"
              />
            </div>
          </div>
        </Asterisk>

        <Controls>
          <button onClick={() => history.push('/')}>Voltar</button>
          <button onClick={saveUserConfig}>Salvar</button>
        </Controls>
      </Container>
    </>
  );
};

export default User;
