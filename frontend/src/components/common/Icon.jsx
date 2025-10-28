// src/components/common/Icon.jsx
import React from 'react';
import * as Icons from 'react-icons/fa'; // Font Awesome
// Thêm các bộ khác nếu cần:
// import * as MdIcons from 'react-icons/md';
// import * as IoIcons from 'react-icons/io5';

const iconLibraries = {
  fa: Icons,
  // md: MdIcons,
  // io: IoIcons,
};

const Icon = ({ name, ...props }) => {
  // Tách prefix (fa, md, io) và tên icon
  const [prefix, iconName] = name.split(/(?=[A-Z])/);
  const library = iconLibraries[prefix.toLowerCase()];

  if (!library || !iconName) {
    console.warn(`Icon "${name}" không tồn tại`);
    return null;
  }

  const IconComponent = library[prefix + iconName];
  if (!IconComponent) {
    console.warn(`Icon "${name}" không tồn tại trong ${prefix}`);
    return null;
  }

  return <IconComponent {...props} />;
};

export default Icon;