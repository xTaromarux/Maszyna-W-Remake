'use client';

import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { CodeMirrorEditorProps } from '@/Editor/CodeMirrorEditor/Types';
import type { RuntimeCommand } from '@/Assembler/Types/Registry';
import { useState } from 'react';
import { useCodeMirrorEditor } from './Hooks/UseCodeMirrorEditor';
import ExpandEditorIcon from './Ui/ExpandEditorIcon';
import ExpandedEditorControls from './Ui/ExpandedEditorControls';

const EMPTY_COMMANDS: RuntimeCommand[] = [];

const CodeMirrorEditor = ({
  modelValue = '',
  onUpdateModelValue,
  onChange,
  language,
  theme,
  readOnly = false,
  programCompiled = false,
  disable = false,
  onCompile,
  onEdit,
  autocompleteEnabled = true,
  commandList = EMPTY_COMMANDS,
  maxHeight = '32rem',
  className = '',
  style,
  ...rest
}: CodeMirrorEditorProps) => {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const isEditorReadOnly = readOnly || disable || programCompiled;
  const supportsExpansion = language === 'macroW';
  const isExpanded = supportsExpansion && expanded;

  const editorContainer = useCodeMirrorEditor({
    modelValue,
    onUpdateModelValue,
    onChange,
    language,
    theme,
    isReadOnly: isEditorReadOnly,
    autocompleteEnabled,
    commandList,
  });

  return (
    <div
      data-editor-codemirror-editor=""
      {...rest}
      className={`editor-wrapper${isExpanded ? ' full-screen' : ''}${programCompiled ? ' dimmed' : ''} ${className}`}
      style={{ '--editorMaxHeight': maxHeight, ...style }}
    >
      {supportsExpansion && (
        <button
          type="button"
          data-editor-codemirror-editor=""
          onClick={() => setExpanded((previous) => !previous)}
          className="fullscreen-button"
          aria-label={t(isExpanded ? 'editor.collapse' : 'editor.expand')}
          aria-expanded={isExpanded}
        >
          <ExpandEditorIcon expanded={isExpanded} />
        </button>
      )}
      {isExpanded && (
        <ExpandedEditorControls
          compiled={programCompiled}
          canCompile={Boolean(modelValue.trim()) && !disable && !readOnly}
          onCompile={onCompile}
          onEdit={onEdit}
        />
      )}
      {programCompiled && <div data-editor-codemirror-editor="" className="overlay-lock" aria-hidden="true" />}
      <div
        data-editor-codemirror-editor=""
        ref={editorContainer}
        className={`codemirror-container${isExpanded ? ' full-screen' : ''}${programCompiled ? ' dimmed' : ''}`}
      />
    </div>
  );
};

export default CodeMirrorEditor;
