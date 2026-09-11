'use client';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import MaszynaW from './MaszynaW';
import CommandList from './CommandList';
import ProgramSection from './InstructionsEditor/ProgramSection';
import TopBar from './UI/TopBar';
import AiChat from './AiChat';
import ConsoleDock from './Console/ConsoleDock';
import SettingsOverlay from './Settings/SettingsOverlay';
import LabCatalogDialog from './Settings/LabCatalogDialog';
import ExecutionControls from './MicroInstructionsEdtior/ExecutionControls';
import ProgramEditor from './MicroInstructionsEdtior/ProgramEditor';
import { createMachineStore } from '@/state/createMachineStore';
import { MachineContext } from '@/state/MachineContext';
import { useI18n } from '@/i18n';

export default function Main() {
  const [store] = useState(createMachineStore);
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const m = store.machine;
  const { t } = useI18n();
  useEffect(() => {
    store.start();
    return () => store.dispose();
  }, [store]);
  const services = useMemo(() => ({ showToast: m.showToast, getMaxValueForRegister: m.getMaxValueForRegister }), [m]);
  const update = (field) => (value) => {
    m[field] = value;
  };
  const execution = {
    manualMode: m.manualMode,
    codeCompiled: m.codeCompiled,
    code: m.code,
    isRunning: m.isRunning,
    isFastRunning: m.isFastRunning,
    fastProgress: m.fastProgress,
    onCompile: m.compileCode,
    onEdit: m.uncompileCode,
    onStep: m.executeLine,
    onRun: m.runCode,
    onRunFast: m.runToEndFast,
    onStop: m.stopRun,
  };
  const registerProps = {};
  for (const field of ['programCounter', 'I', 'ACC', 'JAML', 'A', 'S', 'mem', 'X', 'Y', 'RB', 'G', 'RZ', 'RP', 'RM', 'AP', 'WS']) {
    registerProps[field] = m[field];
    registerProps[`onUpdate${field[0].toUpperCase()}${field.slice(1)}`] = update(field);
  }
  const closeBackdrop = () => {
    m.closePopups('settingsOpen');
    m.closePopups('commandListOpen');
  };
  return (
    <MachineContext.Provider value={services}>
      <TopBar
        hasConsoleErrors={m.hasConsoleErrors}
        wsStatus={m.wsStatus}
        onOpenChat={() => {
          m.aiChatOpen = true;
        }}
        onOpenSettings={() => {
          m.settingsOpen = true;
        }}
        onToggleConsole={m.toggleConsole}
        onWsReconnect={m.reconnectWS}
      />
      <div id="wLayout">
        <MaszynaW
          {...registerProps}
          manualMode={m.manualMode}
          signals={m.signals}
          decSigned={m.decSigned}
          formatNumber={m.formatNumber}
          registerFormats={m.registerFormats}
          extras={m.extras}
          BusA={m.BusA}
          BusS={m.BusS}
          rzInputs={m.RZInputs}
          wordBits={m.codeBits + m.addresBits}
          decToCommand={m.decToCommand}
          decToArgument={m.decToArgument}
          onClickItem={m.handleSignalToggle}
          onUpdateRzInputs={update('RZInputs')}
          onUpdateNumberFormat={({ field, value }) => {
            m.registerFormats[field] = value;
          }}
        />
        <div id="inputs">
          <ProgramEditor
            manualMode={m.manualMode}
            codeCompiled={m.codeCompiled}
            code={m.code}
            compiledCode={m.compiledCode}
            activeLine={m.activeLine}
            nextLine={m.nextLine}
            showIo={m.extras.io.rbRegister}
            devIn={m.DEV_IN}
            devOut={m.DEV_OUT}
            devReady={m.DEV_READY}
            wordBits={m.codeBits + m.addresBits}
            formatNumber={m.formatNumber}
            breakpoints={m.breakpoints}
            breakpointsEnabled={m.breakpointsEnabled}
            onToggleBreakpoint={m.toggleBreakpoint}
            onSetManualMode={(flag) => (flag ? m.manualModeCheck() : m.manualModeUncheck())}
            onUpdateCode={update('code')}
            onUpdateDevIn={(value) => {
              m.DEV_IN = value;
              m.DEV_READY = value ? 0 : 1;
            }}
            onUpdateDevReady={update('DEV_READY')}
          />
          <ExecutionControls {...execution} />
        </div>
        <ProgramSection
          manualMode={m.manualMode}
          commandList={m.commandList}
          program={m.program}
          codeBits={m.codeBits}
          addresBits={m.addresBits}
          autocompleteEnabled={m.autocompleteEnabled}
          autoResetOnAsmCompile={m.autoResetOnAsmCompile}
          onUpdateCode={m.handleProgramSectionCompile}
          onLog={(event) => m.addLog(event.message, event.class, event.error)}
          onInitMemory={m.applyInitMemory}
          onResetRegisters={m.handleAsmAutoReset}
        />
        <ConsoleDock
          {...execution}
          logs={m.logs.slice().reverse()}
          breakpointsEnabled={m.breakpointsEnabled}
          consoleOpen={m.consoleOpen}
          hasConsoleErrors={m.hasConsoleErrors}
          onClose={m.closeConsole}
          onClear={m.clearConsole}
          onOpen={m.toggleConsole}
          onUpdateBreakpointsEnabled={update('breakpointsEnabled')}
          onDisableAllBreakpoints={() => {
            m.breakpointsEnabled = false;
          }}
          onClearBreakpoints={() => {
            m.breakpoints.clear();
            m.addLog(t('logs.breakpointsCleared'), 'system');
          }}
          className={!m.consoleOpen ? 'console-collapsed' : ''}
        />
        {!m.consoleOpen && (
          <div
            className={`console-indicator ${m.hasConsoleErrors ? 'has-errors' : ''}`}
            role="button"
            tabIndex={0}
            onClick={m.toggleConsole}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                m.toggleConsole();
              }
            }}
            title={t('consoleDock.openConsole')}
            aria-label={t('consoleDock.openConsole')}
          />
        )}
        {m.disappearBlour && <div onClick={closeBackdrop} className={m.globalBackdropOpen ? 'show' : 'hide'} id="popupsBackdrop" />}
        <SettingsOverlay
          settingsOpen={m.settingsOpen}
          isMobile={m.isMobile}
          lightMode={m.lightMode}
          language={m.language}
          numberFormat={m.numberFormat}
          codeBits={m.codeBits}
          addresBits={m.addresBits}
          decSigned={m.decSigned}
          oddDelay={m.oddDelay}
          stepDelay={m.stepDelay}
          extras={m.extras}
          autocompleteEnabled={m.autocompleteEnabled}
          autoResetOnAsmCompile={m.autoResetOnAsmCompile}
          onClose={() => m.closePopups('settingsOpen')}
          onUpdateLightMode={update('lightMode')}
          onUpdateLanguage={update('language')}
          onUpdateNumberFormat={update('numberFormat')}
          onUpdateDecSigned={update('decSigned')}
          onUpdateCodeBits={update('codeBits')}
          onUpdateAddresBits={update('addresBits')}
          onUpdateOddDelay={update('oddDelay')}
          onUpdateStepDelay={update('stepDelay')}
          onUpdateExtras={(patch) => {
            m.extras = m.mergeExtras(m.extras, patch);
          }}
          onResetValues={() => m.resetValues()}
          onDefaultSettings={m.restoreDefaults}
          onOpenCommandList={m.openCommandList}
          onOpenLabDialog={m.openLabDialog}
          onUpdateAutocompleteEnabled={update('autocompleteEnabled')}
          onUpdateAutoResetOnAsmCompile={update('autoResetOnAsmCompile')}
          onColorChange={m.sendColorToESP}
        />
        <LabCatalogDialog
          visible={m.labDialogOpen}
          labs={m.localizedLabCatalog}
          selectedLabId={m.selectedLabId}
          onClose={m.closeLabDialog}
          onSelectLab={m.selectLab}
          onLoadLab={m.loadSelectedLab}
        />
        <CommandList
          visible={m.commandListOpen}
          commandList={m.commandList}
          codeBits={m.codeBits}
          onUpdateCommandList={update('commandList')}
          onClose={() => m.closePopups('commandListOpen')}
        />
        <AiChat
          visible={m.aiChatOpen}
          onClose={() => m.closePopups('aiChatOpen')}
          title={t('aiChat.title')}
          placeholder={t('aiChat.placeholder')}
          instruction={t('aiChat.instruction')}
        />
      </div>
      {m.toast.visible && (
        <div className="app-toast" role="status" aria-live="polite">
          {m.toast.message}
        </div>
      )}
      {m.errorMessage && (
        <div className="app-toast" role="alert">
          {m.errorMessage}
        </div>
      )}
    </MachineContext.Provider>
  );
}
