import { EmptyStateIllustration } from '../icons';

export function DefaultIllustration() {
  return (
    <EmptyStateIllustration
      aria-hidden='true'
      focusable={false}
      style={{
        width: 'clamp(160px, 22vw, 220px)',
        height: 'auto',
        flexShrink: 0,
      }}
    />
  );
}
