import { useState } from 'react';

export function usePasswordVisibility() {
  const [show, setShow] = useState(false);

  const toggle = () => setShow(!show);
  const hide = () => setShow(false);

  return { show, toggle, hide };
}
