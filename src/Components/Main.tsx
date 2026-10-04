'use client';

import { useI18n } from '@/I18n/Index';
import { MachineContext } from '@/State/MachineContext';
import type { ProcessorDiagramProps } from '@/Types/Components';
import type { LogEvent } from '@/Types/Simulator';
import ConsoleDock from './Console/ConsoleDock';
import ProgramSection from './InstructionsEditor/ProgramSection';
import ProcessorDiagram from './ProcessorDiagram';
import ExecutionControls from './MicroInstructionsEditor/ExecutionControls';
import ProgramEditor from './MicroInstructionsEditor/ProgramEditor';
import TopBar from './Ui/TopBar';
import { useMachine } from './Main/Hooks/UseMachine';
import { createMachineUpdater, createExecutionBindings, createRegisterBindings } from './Main/Helpers/MachineBindings';
import { MachineOverlays } from './Main/Ui/MachineOverlays';

/** Composes simulator views around the single observable machine instance. */
const Main = () => {
  const { machine, services } = useMachine();
  const { t } = useI18n();
  const update = createMachineUpdater(machine);
  const execution = createExecutionBindings(machine);
  const registerProps = createRegisterBindings(machine, update);

  const openChat = () => {
    machine.aiChatOpen = true;
  };
  const openSettings = () => {
    machine.settingsOpen = true;
  };

  const updateRegisterFormat: NonNullable<ProcessorDiagramProps['onUpdateNumberFormat']> = ({ field, value }) => {
    machine.registerFormats[field] = value;
  };

  const setManualMode = (enabled: boolean) => {
    if (enabled) {
      machine.manualModeCheck();
    } else {
      machine.manualModeUncheck();
    }
  };

  const updateDeviceInput = (value: number) => {
    machine.DEV_IN = value;
    machine.DEV_READY = value ? 0 : 1;
  };

  const logProgramEvent = (event: LogEvent) => {
    machine.addLog(event.message, event.class, event.error);
  };

  const disableBreakpoints = () => {
    machine.breakpointsEnabled = false;
  };

  const clearBreakpoints = () => {
    machine.breakpoints.clear();
    machine.addLog(t('logs.breakpointsCleared'), 'system');
  };

  const breakpointControls = {
    breakpointsEnabled: machine.breakpointsEnabled,
    onUpdateBreakpointsEnabled: update('breakpointsEnabled'),
    onDisableAllBreakpoints: disableBreakpoints,
    onClearBreakpoints: clearBreakpoints,
  };

  return (
    <MachineContext.Provider value={services}>
      <TopBar
        hasConsoleErrors={machine.hasConsoleErrors}
        wsStatus={machine.wsStatus}
        onOpenChat={openChat}
        onOpenSettings={openSettings}
        onToggleConsole={machine.toggleConsole}
        onWsReconnect={machine.reconnectWS}
      />
      <div id="wLayout">
        <ProcessorDiagram
          {...registerProps}
          manualMode={machine.manualMode}
          signals={machine.signals}
          decSigned={machine.decSigned}
          formatNumber={machine.formatNumber}
          registerFormats={machine.registerFormats}
          extras={machine.extras}
          BusA={machine.BusA}
          BusS={machine.BusS}
          wordBits={machine.codeBits + machine.addresBits}
          decToCommand={machine.decToCommand}
          decToArgument={machine.decToArgument}
          onClickItem={machine.handleSignalToggle}
          onUpdateNumberFormat={updateRegisterFormat}
        />
        <div id="inputs">
          <ProgramEditor
            manualMode={machine.manualMode}
            codeCompiled={machine.codeCompiled}
            code={machine.code}
            compiledCode={machine.compiledCode}
            activeLine={machine.activeLine}
            nextLine={machine.nextLine}
            showIo={machine.extras.io.rbRegister}
            devIn={machine.DEV_IN}
            devOut={machine.DEV_OUT}
            devReady={machine.DEV_READY}
            wordBits={machine.codeBits + machine.addresBits}
            formatNumber={machine.formatNumber}
            breakpoints={machine.breakpoints}
            breakpointsEnabled={machine.breakpointsEnabled}
            onToggleBreakpoint={machine.toggleBreakpoint}
            onSetManualMode={setManualMode}
            onUpdateCode={update('code')}
            onUpdateDevIn={updateDeviceInput}
            onUpdateDevReady={update('DEV_READY')}
          />
          <ExecutionControls {...execution} />
        </div>
        <ProgramSection
          manualMode={machine.manualMode}
          commandList={machine.commandList}
          program={machine.program}
          codeBits={machine.codeBits}
          addresBits={machine.addresBits}
          autocompleteEnabled={machine.autocompleteEnabled}
          autoResetOnAsmCompile={machine.autoResetOnAsmCompile}
          onUpdateCode={machine.handleProgramSectionCompile}
          onLog={logProgramEvent}
          onInitMemory={machine.applyInitMemory}
          onResetRegisters={machine.handleAsmAutoReset}
        />
        <ConsoleDock
          execution={execution}
          logs={machine.logs.slice().reverse()}
          consoleOpen={machine.consoleOpen}
          hasConsoleErrors={machine.hasConsoleErrors}
          onClose={machine.closeConsole}
          onClear={machine.clearConsole}
          onOpen={machine.toggleConsole}
          breakpoints={breakpointControls}
          className={!machine.consoleOpen ? 'console-collapsed' : ''}
        />
        {!machine.consoleOpen && (
          <button
            className={`console-indicator ${machine.hasConsoleErrors ? 'has-errors' : ''}`}
            type="button"
            onClick={machine.toggleConsole}
            title={t('consoleDock.openConsole')}
            aria-label={t('consoleDock.openConsole')}
          />
        )}
        <MachineOverlays machine={machine} update={update} />
      </div>
      {machine.toast.visible && (
        <div className="app-toast" role="status" aria-live="polite">
          {machine.toast.message}
        </div>
      )}
      {machine.errorMessage && (
        <div className="app-toast" role="alert">
          {machine.errorMessage}
        </div>
      )}
    </MachineContext.Provider>
  );
};

export default Main;
