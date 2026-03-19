import { Icon, IconProps } from '@chakra-ui/react';

const ArrowDownIcon = (props: IconProps) => (
  <Icon
    asChild
    {...props}
  >
    <svg
      fill='none'
      height='100%'
      width='auto'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
    >
      <path
        stroke='none'
        d='M0 0h24v24H0z'
        fill='none'
      />
      <path d='M4 11l8 3l8 -3' />
    </svg>
  </Icon>
);

export default ArrowDownIcon;
