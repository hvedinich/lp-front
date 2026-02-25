export const workspaceSections = ['reviews', 'surveys', 'scans', 'campaigns', 'locations'] as const;

export type WorkspaceSection = (typeof workspaceSections)[number];

export const isWorkspaceSection = (value: string): value is WorkspaceSection => {
  return workspaceSections.includes(value as WorkspaceSection);
};

export const getWorkspaceSection = (value: string | undefined): WorkspaceSection => {
  if (value && isWorkspaceSection(value)) {
    return value;
  }

  return 'reviews';
};
