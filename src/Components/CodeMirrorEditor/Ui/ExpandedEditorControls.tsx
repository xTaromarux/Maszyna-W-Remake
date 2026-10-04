import CompileIcon from '@/Assets/Svg/CompileIcon';
import EditIcon from '@/Assets/Svg/EditIcon';
import { useI18n } from '@/I18n/Index';

interface ExpandedEditorControlsProps {
  compiled: boolean;
  canCompile: boolean;
  onCompile?: () => void;
  onEdit?: () => void;
}

const ExpandedEditorControls = ({ compiled, canCompile, onCompile, onEdit }: ExpandedEditorControlsProps) => {
  const { t } = useI18n();

  return (
    <div data-editor-codemirror-editor="" className="fullscreen-controls">
      {compiled ? (
        <button type="button" data-editor-codemirror-editor="" onClick={onEdit} className="execution-btn execution-btn--edit">
          <EditIcon />
          <span>{t('execution.edit')}</span>
        </button>
      ) : (
        <button
          type="button"
          data-editor-codemirror-editor=""
          onClick={onCompile}
          disabled={!canCompile}
          className="execution-btn execution-btn--compile"
        >
          <CompileIcon />
          <span>{t('execution.compile')}</span>
        </button>
      )}
    </div>
  );
};

export default ExpandedEditorControls;
