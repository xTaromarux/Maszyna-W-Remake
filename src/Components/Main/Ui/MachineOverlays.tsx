import { useI18n } from '@/I18n/Index';
import type { ExtrasPatch, Machine } from '@/Types/Simulator';
import type { UpdateMachineField } from '../Helpers/MachineBindings';
import AiChat from '../../AiChat/AiChat';
import CommandList from '../../CommandList';
import LabCatalogDialog from '../../Settings/LabCatalogDialog';
import SettingsOverlay from '../../Settings/SettingsOverlay';

interface MachineOverlaysProps {
  machine: Machine;
  update: UpdateMachineField;
}

/** Connects simulator settings and catalogs to overlays without owning additional machine state. */
export const MachineOverlays = ({ machine, update }: MachineOverlaysProps) => {
  const { t } = useI18n();
  const closeSettings = () => machine.closePopups('settingsOpen');
  const closeCommands = () => machine.closePopups('commandListOpen');
  const closeChat = () => machine.closePopups('aiChatOpen');
  const closeBackdrop = () => {
    closeSettings();
    closeCommands();
  };

  const updateExtras = (patch: ExtrasPatch) => {
    machine.extras = machine.mergeExtras(machine.extras, patch);
  };

  const resetValues = () => machine.resetValues();

  return (
    <>
      {machine.disappearBlour && (
        <div onClick={closeBackdrop} className={machine.globalBackdropOpen ? 'show' : 'hide'} id="popupsBackdrop" />
      )}
      <SettingsOverlay
        settingsOpen={machine.settingsOpen}
        isMobile={machine.isMobile}
        lightMode={machine.lightMode}
        language={machine.language}
        numberFormat={machine.numberFormat}
        codeBits={machine.codeBits}
        addresBits={machine.addresBits}
        decSigned={machine.decSigned}
        oddDelay={machine.oddDelay}
        stepDelay={machine.stepDelay}
        extras={machine.extras}
        autocompleteEnabled={machine.autocompleteEnabled}
        autoResetOnAsmCompile={machine.autoResetOnAsmCompile}
        onClose={closeSettings}
        onUpdateLightMode={update('lightMode')}
        onUpdateLanguage={update('language')}
        onUpdateNumberFormat={update('numberFormat')}
        onUpdateDecSigned={update('decSigned')}
        onUpdateCodeBits={update('codeBits')}
        onUpdateAddresBits={update('addresBits')}
        onUpdateOddDelay={update('oddDelay')}
        onUpdateStepDelay={update('stepDelay')}
        onUpdateExtras={updateExtras}
        onResetValues={resetValues}
        onDefaultSettings={machine.restoreDefaults}
        onOpenCommandList={machine.openCommandList}
        onOpenLabDialog={machine.openLabDialog}
        onUpdateAutocompleteEnabled={update('autocompleteEnabled')}
        onUpdateAutoResetOnAsmCompile={update('autoResetOnAsmCompile')}
        onColorChange={machine.sendColorToESP}
      />
      <LabCatalogDialog
        visible={machine.labDialogOpen}
        labs={machine.localizedLabCatalog}
        selectedLabId={machine.selectedLabId}
        onClose={machine.closeLabDialog}
        onSelectLab={machine.selectLab}
        onLoadLab={machine.loadSelectedLab}
      />
      <CommandList
        visible={machine.commandListOpen}
        commandList={machine.commandList}
        codeBits={machine.codeBits}
        onUpdateCommandList={update('commandList')}
        onClose={closeCommands}
      />
      <AiChat
        visible={machine.aiChatOpen}
        onClose={closeChat}
        title={t('aiChat.title')}
        placeholder={t('aiChat.placeholder')}
        instruction={t('aiChat.instruction')}
      />
    </>
  );
};
