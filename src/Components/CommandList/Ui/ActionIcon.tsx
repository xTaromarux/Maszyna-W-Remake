import type { ActionIconProps } from '@/Types/Components';

export const ActionIcon = ({ name }: ActionIconProps) => {
  const paths = {
    trash: (
      <>
        <polyline data-editor-command-list="" points="3 6 5 6 21 6" />
        <path data-editor-command-list="" d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path data-editor-command-list="" d="M10 11v6m4-6v6" />
        <path data-editor-command-list="" d="M15 6V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2" />
      </>
    ),
    confirm: <polyline data-editor-command-list="" points="20 6 9 17 4 12" />,
    cancel: <path data-editor-command-list="" d="M18 6L6 18M6 6l12 12" />,
    edit: (
      <path
        data-editor-command-list=""
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    ),
    add: (
      <>
        <path data-editor-command-list="" d="M12 16V8m4 4H8" />
        <circle data-editor-command-list="" cx="12" cy="12" r="9" />
      </>
    ),
    load: (
      <path
        data-editor-command-list=""
        d="M12 10v9m0-9l3 3m-3-3l-3 3m8.5 2c1.519 0 2.5-1.231 2.5-2.75a2.75 2.75 0 00-2.016-2.65A5 5 0 008.37 8.108a3.5 3.5 0 00-1.87 6.746"
      />
    ),
    download: <path data-editor-command-list="" d="M12 5v8.5m0 0l3-3m-3 3l-3-3M5 15v2a2 2 0 002 2h10a2 2 0 002-2v-2" />,
  };
  return (
    <svg
      data-editor-command-list=""
      xmlns="http://www.w3.org/2000/svg"
      width={name === 'trash' ? 24 : 20}
      height={name === 'trash' ? 24 : 20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
};
