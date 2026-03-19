import { Icon, IconProps } from '@chakra-ui/react';

const CalendarIcon = (props: IconProps) => (
  <Icon
    asChild
    {...props}
  >
    <svg
      fill='none'
      height='100%'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      viewBox='0 0 24 24'
      width='auto'
    >
      <path
        stroke='none'
        d='M0 0h24v24H0z'
        fill='none'
      />
      <path d='M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z' />
      <path d='M16 3v4' />
      <path d='M8 3v4' />
      <path d='M4 11h16' />
      <path d='M7 14h.013' />
      <path d='M10.01 14h.005' />
      <path d='M13.01 14h.005' />
      <path d='M16.015 14h.005' />
      <path d='M13.015 17h.005' />
      <path d='M7.01 17h.005' />
      <path d='M10.01 17h.005' />
    </svg>
  </Icon>
);

export default CalendarIcon;
