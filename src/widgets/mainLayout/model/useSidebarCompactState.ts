import { useEffect, useState } from 'react';

const SIDEBAR_COLLAPSE_TRANSITION_MS = 240;

/**
 * Delays switching to compact rendering until sidebar width collapse animation finishes.
 */
export const useSidebarCompactState = (isCollapsed: boolean) => {
  const [isCompactUi, setCompactUi] = useState(isCollapsed);

  useEffect(() => {
    const timerId = window.setTimeout(
      () => {
        setCompactUi(isCollapsed);
      },
      isCollapsed ? SIDEBAR_COLLAPSE_TRANSITION_MS : 0,
    );

    return () => window.clearTimeout(timerId);
  }, [isCollapsed]);

  return {
    isCompactUi,
    isCollapsingToCompact: isCollapsed && !isCompactUi,
  };
};
