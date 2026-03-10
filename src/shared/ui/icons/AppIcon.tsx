import { Icon, type IconProps } from '@chakra-ui/react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import { forwardRef } from 'react';

export interface AppIconProps extends Omit<IconProps, 'as' | 'size'> {
  size?: number;
  strokeWidth?: LucideProps['strokeWidth'];
  absoluteStrokeWidth?: LucideProps['absoluteStrokeWidth'];
}

interface BaseAppIconProps extends AppIconProps {
  icon: LucideIcon;
}

export const AppIcon = forwardRef<SVGSVGElement, BaseAppIconProps>(function AppIcon(
  { icon, size, style, ...rest },
  ref,
) {
  const sizeStyle =
    typeof size === 'number'
      ? {
          width: `${size}px`,
          height: `${size}px`,
        }
      : undefined;

  return (
    <Icon
      as={icon}
      ref={ref}
      flexShrink={0}
      style={sizeStyle ? { ...sizeStyle, ...style } : style}
      {...rest}
    />
  );
});
