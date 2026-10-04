import type { Action } from '../../../Shared/Types/Common';

export interface TextContentProps {
  text: string;
}

export interface CodeBlockProps {
  code: string;
  language: string;
}

export interface AiChatProps {
  visible?: boolean;
  title?: string;
  placeholder?: string;
  instruction?: string;
  onClose?: Action;
}
