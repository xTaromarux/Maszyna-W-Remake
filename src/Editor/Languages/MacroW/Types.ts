export interface MacroCompletionItem {
  label: string;
  detail?: string;
  insertText?: string;
}

export interface MacroCompletionOption {
  label: string;
  type: 'keyword';
  detail?: string;
  apply?: string;
}
