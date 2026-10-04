import CompileIcon from '@/Shared/Ui/Icons/CompileIcon';
import EditIcon from '@/Shared/Ui/Icons/EditIcon';
import { useI18n } from '@/I18n/Hooks/UseI18n';

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
