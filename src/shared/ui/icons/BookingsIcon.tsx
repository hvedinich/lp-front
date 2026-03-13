import { Icon, IconProps } from '@chakra-ui/react';

const BookingsIcon = (props: IconProps) => (
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
      <path d='M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4' />
      <path d='M9 15l-4.5 4.5' />
      <path d='M14.5 4l5.5 5.5' />
    </svg>
  </Icon>
);

export default BookingsIcon;
