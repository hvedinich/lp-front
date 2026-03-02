/**
 * LogoIcon — inline SVG version of the LocalProf brand mark.
 *
 * Using inline SVG (instead of <Image>) avoids strictTokens constraints on
 * width/height style props and ensures crisp rendering at any size without
 * an extra network request.
 *
 * Source: /public/logo.svg (copied from localprof/apps/landing/public/logo/logo.svg)
 */
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 522 522'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      focusable='false'
      style={{ flexShrink: 0 }}
    >
      <g clipPath='url(#logo-clip)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M261 -1.14087e-05C405.141 -5.10805e-06 522 116.848 522 261C522 405.141 405.151 522 261 522C116.848 522 -3.39222e-05 405.152 -2.76211e-05 261C-2.13201e-05 116.848 116.859 -1.77093e-05 261 -1.14087e-05ZM144 145.692C144 141.996 146.996 139 150.692 139H325.084C374.191 139 414 178.743 414 227.77V271.6C414 320.626 374.191 360.37 325.084 360.37H231.3V392.308C231.3 396.004 228.304 399 224.608 399H151.193C147.497 399 144.501 396.004 144.501 392.308V296.963L144 202.407V145.692ZM216.032 212.532C217.992 210.572 221.17 210.572 223.13 212.532L255.686 245.089C257.647 247.049 260.825 247.049 262.785 245.089L332.589 175.284C334.549 173.324 337.727 173.324 339.687 175.284L370.145 205.742C372.105 207.702 372.105 210.88 370.145 212.84L262.785 320.2C260.825 322.16 257.647 322.16 255.686 320.2L185.575 250.088C183.614 248.128 183.614 244.95 185.575 242.99L216.032 212.532Z'
          fill='#D44B56'
        />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M216.007 212.452C217.967 210.492 221.145 210.492 223.105 212.452L255.661 245.008C257.621 246.969 260.799 246.969 262.759 245.008L332.563 175.204C334.524 173.244 337.702 173.244 339.662 175.204L370.119 205.662C372.079 207.622 372.079 210.8 370.119 212.76L262.759 320.12C260.799 322.08 257.621 322.08 255.661 320.12L185.549 250.008C183.589 248.048 183.589 244.87 185.549 242.91L216.007 212.452Z'
          fill='#D44B56'
        />
      </g>
      <defs>
        <clipPath id='logo-clip'>
          <rect
            width='522'
            height='522'
            rx='261'
            fill='white'
          />
        </clipPath>
      </defs>
    </svg>
  );
}
