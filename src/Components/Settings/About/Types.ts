export interface Person {
  name?: string;
  baseName?: string;
  titles?: string[];
  roles?: string[];
  github?: string;
  linkedin?: string;
}

export interface CreatorsPanelProps {
  isMobile?: boolean;
  isAnimated?: boolean;
  creators?: Person[];
  caregivers?: Person[];
}

export interface PeopleSectionProps {
  title?: string;
  people?: Person[];
  showGithub?: boolean;
  columns?: number;
}
