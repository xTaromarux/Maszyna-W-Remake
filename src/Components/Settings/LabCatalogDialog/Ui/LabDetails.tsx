import { useI18n } from '@/I18n/Index';
import type { LocalizedLab } from '@/Types/Simulator';

type LabDetailsProps = { lab: LocalizedLab };

const LabDetails = ({ lab }: LabDetailsProps) => {
  const { t } = useI18n();

  return (
    <article className="labDetails">
      <h3>{lab.title}</h3>
      <p>{lab.description}</p>
      <h4>{t('labs.dialog.outcomesTitle')}</h4>
      <ul className="labOutcomeList">
        {lab.outcomes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h4>{t('labs.dialog.pythonOverview')}</h4>
      <pre className="pythonPreview">
        <code>{lab.pythonOverview}</code>
      </pre>
      <h4>{t('labs.dialog.asmMapping')}</h4>
      <pre className="asmPreview">
        <code>{lab.asmStub}</code>
      </pre>
    </article>
  );
};

export default LabDetails;
