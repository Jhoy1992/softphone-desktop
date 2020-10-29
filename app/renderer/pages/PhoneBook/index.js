import React, { useState, useEffect, useContext } from 'react';
import ReactLoading from 'react-loading';
import { FiUser } from 'react-icons/fi';
import { BiBuilding, BiPhone } from 'react-icons/bi';
import { AiOutlineMail } from 'react-icons/ai';
import { BsCircleFill } from 'react-icons/bs';

import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import { store } from '../../store';
import { addNotification } from '../../actions/notificationsActions';
import { toggleTooltip } from '../../actions/tooltipActions';
import { toggleMenu } from '../../actions/menuActions';

import Header from '../../components/Header';
import Menu from '../../components/Menu';
import Search from '../../components/Search';

import { Container, Contacts, Contact, Loading, Controls } from './styles';

const STATUS = {
  UNAVAILABLE: '#ccc',
  IN_USE: '#d9534f',
  NOT_INUSE: '#5cb85c',
};

const PhoneBook = ({ history }) => {
  const { dispatch, state } = useContext(store);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [contacts, setContacts] = useState([]);
  const [contactsFiltered, setContactsFiltered] = useState([]);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const searchHistory = async () => {
      if (!debouncedSearchTerm) {
        return;
      }

      setLoading(true);

      const newContacts = contacts.filter(contact => {
        return (
          contact.name?.toLowerCase()?.includes(debouncedSearchTerm.toLowerCase()) ||
          contact.company?.toLowerCase()?.includes(debouncedSearchTerm.toLowerCase()) ||
          contact.phone?.toLowerCase()?.includes(debouncedSearchTerm.toLowerCase()) ||
          contact.email?.toLowerCase()?.includes(debouncedSearchTerm.toLowerCase()) ||
          String(contact.username)?.toLowerCase()?.includes(debouncedSearchTerm.toLowerCase())
        );
      });

      setContactsFiltered(newContacts);
      setLoading(false);
    };

    searchHistory();
  }, [debouncedSearchTerm]);

  const loadContacts = async () => {
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

      const { data: contacts } = await api.get(`https://${state.user.api}/api/contacts`);

      const { data: peers } = await api.get(`https://${state.user.api}/api/peers`, {
        params: { attributes: '["id", "name", "username", "email", "sipRegStatus"]' },
      });

      const newContacts = [];

      newContacts.push(...contacts);
      newContacts.push(
        ...peers.map(({ id, name, username: phone, email, sipRegStatus: status }) => ({
          id,
          name,
          phone,
          email,
          status,
        })),
      );
      newContacts.sort((a, b) => (a.name > b.name ? 1 : -1));

      setContacts([...newContacts]);

      setLoading(false);
    } catch (error) {
      dispatch(addNotification({ message: 'Erro ao buscar os contatos', type: 'error' }));
      setLoading(false);
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

    dispatch(toggleTooltip({ message, position }));
  };

  const hideTooltip = () => {
    dispatch(toggleTooltip({}));
  };

  return (
    <>
      <Header title="Agenda" />
      <Menu />
      <Container onClick={() => dispatch(toggleMenu(false))}>
        <Search value={searchTerm} onChange={event => setSearchTerm(event.target.value)} />

        {loading ? (
          <Loading>
            <p>BUSCANDO INFORMAÇÕES</p>
            <ReactLoading type="bars" color="#bbb" height={64} width={64} />
          </Loading>
        ) : (
          <>
            <Contacts>
              {(debouncedSearchTerm ? contactsFiltered : contacts).map(contact => (
                <Contact
                  key={contact.id}
                  onClick={() => callNumber(contact.phone || contact.username)}
                  onMouseEnter={event => showTooltip(event, 'Clique para chamar')}
                  onMouseLeave={hideTooltip}>
                  <div>
                    <div>
                      <FiUser size={12} />
                      <strong>{contact.name}</strong>
                    </div>

                    {contact.company && (
                      <div>
                        <BiBuilding size={12} />
                        {contact.company}
                      </div>
                    )}
                  </div>

                  <div>
                    <BiPhone size={12} />
                    <strong>{contact.phone}</strong>
                    {contact.status && <BsCircleFill color={STATUS[contact.status]} size={8} />}
                  </div>

                  {contact.email && (
                    <div>
                      <AiOutlineMail size={12} />
                      {contact.email}
                    </div>
                  )}
                </Contact>
              ))}
            </Contacts>
          </>
        )}

        <Controls>
          <button onClick={() => history.push('/')}>Voltar</button>
        </Controls>
      </Container>
    </>
  );
};

export default PhoneBook;
