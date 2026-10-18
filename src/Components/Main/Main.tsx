'use client';

import { useI18n } from '@/I18n/Hooks/UseI18n';
import { MachineContext } from '@/Machine/MachineContext';
import Console from '../Console/Console';
import ConsoleControls from '../Console/Ui/ConsoleControls';
import AssemblyEditor from '../AssemblyEditor/AssemblyEditor';
import ProcessorDiagram from '../ProcessorDiagram/ProcessorDiagram';
import MicrocodeEditor from '../MicrocodeEditor/MicrocodeEditor';
import ExecutionControls from '../MicrocodeEditor/ExecutionControls';
import IOPanel from '../MicrocodeEditor/Ui/IoPanel';
import TopBar from './Ui/TopBar';
import { useMachine } from './Hooks/UseMachine';
import {
  createMachineUpdater,
  createExecutionBindings,
  createRegisterBindings,
  createMainInteractionBindings,
} from './Bindings/MachineBindings';
import { MachineOverlays } from './Ui/MachineOverlays';
import EditorWorkspace from './Ui/EditorWorkspace';
import MobileControls from './Ui/MobileControls';

/** Composes simulator views around the single observable machine instance. */
const Main = () => {
  const { machine, services } = useMachine();
  const { t } = useI18n();
  const update = createMachineUpdater(machine);
  const execution = createExecutionBindings(machine);
  const registerProps = createRegisterBindings(machine, update);

  const interactions = createMainInteractionBindings(machine, t);

  const breakpointControls = {
    breakpointsEnabled: machine.breakpointsEnabled,
    onUpdateBreakpointsEnabled: update('breakpointsEnabled'),
    onDisableAllBreakpoints: interactions.disableBreakpoints,
    onClearBreakpoints: interactions.clearBreakpoints,
  };

  return (
    <MachineContext.Provider value={services}>
      <TopBar
        hasConsoleErrors={machine.hasConsoleErrors}
        wsStatus={machine.wsStatus}
        onOpenChat={interactions.openChat}
        onOpenSettings={interactions.openSettings}
        onToggleConsole={machine.toggleConsole}
        onWsReconnect={machine.reconnectWS}
      />
      <div id="wLayout">
        <div id="processorViewport" className="processor-viewport" role="region" aria-label={t('workspace.diagram')} tabIndex={0}>
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
            onUpdateNumberFormat={interactions.updateRegisterFormat}
          />
        </div>
        <EditorWorkspace
          manualMode={machine.manualMode}
          consoleOpen={machine.consoleOpen}
          hasConsoleErrors={machine.hasConsoleErrors}
          onSetManualMode={interactions.setManualMode}
          onOpenConsole={machine.toggleConsole}
          onCloseConsole={machine.closeConsole}
          microcode={
            <div id="inputs">
              <MicrocodeEditor
                manualMode={machine.manualMode}
                codeCompiled={machine.codeCompiled}
                code={machine.code}
                compiledCode={machine.compiledCode}
                activeLine={machine.activeLine}
                nextLine={machine.nextLine}
                breakpoints={machine.breakpoints}
                breakpointsEnabled={machine.breakpointsEnabled}
                onToggleBreakpoint={machine.toggleBreakpoint}
                onUpdateCode={update('code')}
              />
              <ExecutionControls {...execution} />
            </div>
          }
          devices={
            <div className="workspace-devices">
              <IOPanel
                devIn={machine.DEV_IN}
                devOut={machine.DEV_OUT}
                devReady={machine.DEV_READY}
                wordBits={machine.codeBits + machine.addresBits}
                formatNumber={machine.formatNumber}
                onUpdateDevIn={interactions.updateDeviceInput}
                onUpdateDevReady={update('DEV_READY')}
              />
            </div>
          }
          asm={
            <AssemblyEditor
              manualMode={machine.manualMode}
              commandList={machine.commandList}
              program={machine.program}
              codeBits={machine.codeBits}
              addresBits={machine.addresBits}
              autocompleteEnabled={machine.autocompleteEnabled}
              autoResetOnAsmCompile={machine.autoResetOnAsmCompile}
              onUpdateCode={machine.handleProgramSectionCompile}
              onLog={interactions.logProgramEvent}
              onInitMemory={machine.applyInitMemory}
              onResetRegisters={machine.handleAsmAutoReset}
              executionControls={<ExecutionControls {...execution} showCompilation={false} />}
            />
          }
          console={
            <div className="console-dock">
              <Console logs={machine.logs.slice().reverse()} onClose={machine.closeConsole} onClear={machine.clearConsole} />
            </div>
          }
          controls={<ConsoleControls execution={execution} breakpoints={breakpointControls} />}
        />
        <MachineOverlays machine={machine} update={update} />
      </div>
      <MobileControls execution={execution} />
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
