import type { IconProps } from '@/Types/Common';

const NextLineIcon = (props: IconProps) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
      <path d="M21 6v12" />
    </svg>
  );
};

export default NextLineIcon;
