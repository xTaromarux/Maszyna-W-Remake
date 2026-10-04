import type { IconProps } from '@/Types/Common';

const ListLinesIcon = (props: IconProps) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="humbleicons hi-view-list"
    >
      <path
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  );
};

export default ListLinesIcon;
