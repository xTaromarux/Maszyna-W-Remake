import CompileIcon from '@/Shared/Ui/Icons/CompileIcon';
import EditIcon from '@/Shared/Ui/Icons/EditIcon';
import { useI18n } from '@/I18n/Hooks/UseI18n';

type Props = {
  isCompiled: boolean;
  canCompile: boolean;
  onCompile: () => void;
  onEdit: () => void;
};

const ProgramActions = ({ isCompiled, canCompile, onCompile, onEdit }: Props) => {
  const { t } = useI18n();

  return (
    <div data-editor-macro-program-section="" className="flexRow">
      {isCompiled ? (
        <button type="button" data-editor-macro-program-section="" onClick={onEdit} className="execution-btn execution-btn--edit">
          <EditIcon />
          <span data-editor-macro-program-section="">{t('execution.edit')}</span>
        </button>
      ) : (
        <button
          type="button"
          data-editor-macro-program-section=""
          onClick={onCompile}
          disabled={!canCompile}
          className="execution-btn execution-btn--compile"
        >
          <CompileIcon />
          <span data-editor-macro-program-section="">{t('execution.compile')}</span>
        </button>
      )}
    </div>
  );
};

export default ProgramActions;
