import { EditorView } from '@codemirror/view';

export const editorAppearance = EditorView.theme({
  '&': { fontSize: '14px', fontFamily: 'monospace' },
  '.cm-editor': { borderStyle: 'solid', borderWidth: '4px', borderColor: '#003c7d', height: '100%' },
  '.cm-scroller': { overflow: 'auto', borderStyle: 'solid', borderRadius: '0.25rem', borderWidth: '4px', borderColor: '#003c7d' },
  '.cm-content': { textAlign: 'left', padding: '10px', minHeight: '100%' },
  '.cm-line': { textAlign: 'left', lineHeight: '1.4' },
  '.cm-selectionBackground': { backgroundColor: '#316AC5 !important', marginTop: '-5px', marginLeft: '-5px', opacity: '0.3 !important' },
  '.cm-focused .cm-selectionBackground': { backgroundColor: '#316AC5 !important', opacity: '0.4 !important' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: '#316AC5 !important' },
  '.cm-cursor': { borderLeftColor: 'var(--fontColor, #000) !important', marginTop: '-4px', marginLeft: '-4px' },
  '.cm-dropCursor': { borderLeftColor: '#316AC5 !important', borderLeftWidth: '2px !important' },
  '.cm-activeLine': { backgroundColor: 'rgba(255, 255, 255, 0.05) !important' },
  '.cm-searchMatch': { backgroundColor: '#ffd700 !important', color: '#000 !important' },
  '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: '#ff8c00 !important' },
  '.tok-labelName, .cmt-labelName, .tok-labelDef, .cmt-labelDef, .tok-labelRef, .cmt-labelRef': {
    color: '#795E26 !important',
    fontStyle: 'italic !important',
  },
});
