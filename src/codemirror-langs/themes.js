import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// mwTheme - equivalent to Monaco's mwTheme
export const mwTheme = [
  EditorView.theme({
    '&': {
      color: '#000000',
      backgroundColor: '#FFFFFF',
    },
    '.cm-content': {
      caretColor: '#000000',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#000000',
    },
    '.cm-selectionBackground, .cm-focused .cm-selectionBackground': {
      backgroundColor: '#ADD6FF',
    },
    '.cm-activeLine': {
      backgroundColor: '#F0F8FF',
    },
    '.cm-gutters': {
      backgroundColor: '#FFFFFF',
      color: '#888888',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#F0F8FF',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      color: '#888888',
    },
    '.cm-searchMatch': {
      backgroundColor: '#FFE0A0',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#FF6200',
    },
  }),
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.keyword, fontWeight: 'bold' },
      { tag: t.number, color: '#098658' },
      { tag: t.labelName, color: '#795E26', fontStyle: 'italic' },
      { tag: t.variableName, color: '#000000' },
      { tag: t.punctuation, color: '#000000' },
      { tag: t.lineComment, color: '#008000', fontStyle: 'italic' },
    ])
  ),
];

// macroTheme - equivalent to Monaco's macroTheme
export const macroTheme = [
  EditorView.theme({
    '&': {
      color: '#000000',
      backgroundColor: '#FCFCFC',
    },
    '.cm-content': {
      caretColor: '#000000',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#000000',
    },
    '.cm-selectionBackground, .cm-focused .cm-selectionBackground': {
      backgroundColor: '#C8E1FF',
    },
    '.cm-activeLine': {
      backgroundColor: '#F5F5F5',
    },
    '.cm-gutters': {
      backgroundColor: '#FCFCFC',
      color: '#666666',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#F5F5F5',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      color: '#666666',
    },
    '.cm-searchMatch': {
      backgroundColor: '#FFE0A0',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#FF6200',
    },
  }),
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.keyword, fontWeight: 'bold' },
      { tag: t.number, color: '#098658' },
      { tag: t.labelName, color: '#795E26', fontStyle: 'italic' },
      { tag: t.variableName, color: '#000000' },
      { tag: t.punctuation, color: '#000000' },
      { tag: t.lineComment, color: '#008000', fontStyle: 'italic' },
    ])
  ),
];
