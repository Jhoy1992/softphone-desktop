import { useState, useRef } from 'react';

const useReferredState = (initialValue = undefined) => {
  const [state, setState] = useState(initialValue);
  const reference = useRef(state);

  const setReferredState = value => {
    reference.current = value;
    setState(value);
  };

  return [state, reference, setReferredState];
};

export default useReferredState;
