import React from 'react';
import doubleArrow from '../icons/double-arrow.svg';
import arrowDown from '../icons/arrow-down.svg';
import arrowUp from '../icons/arrow-up.svg';
import clear from '../icons/clear.svg';

const ICONS = {
  'double-arrow': doubleArrow,
  'arrow-down': arrowDown,
  'arrow-up': arrowUp,
  clear,
};

const Icon = ({ type }) => (
  <span
    style={{ height: 24 }}
    dangerouslySetInnerHTML={{ __html: ICONS[type] }}
  />
);

export default Icon;
