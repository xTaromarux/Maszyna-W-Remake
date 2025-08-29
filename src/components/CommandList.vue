<template>
  <div class="modal-overlay" v-if="visible" @click.self="$emit('close')">
    <div id="commandList">
      <div class="header">
        <h1>Lista rozkazów</h1>
        <button class="closeBtn closeButton" @click="$emit('close')" aria-label="Zamknij listę rozkazów">&times;</button>
      </div>

      <div id="commandListTable">
        <span>{{ commandList.length }} / {{ Math.pow(2, codeBits) }}</span>
        <button
          v-for="(cmd, idx) in commandList"
          :key="idx"
          @click="editCommand(idx)"
          class="execution-btn execution-btn--run"
          :class="{ selected: selectedCommand === idx }"
        >
          <span>{{ cmd.name }}</span>
        </button>
      </div>

      <div class="right-panel">
        <div id="commandDetails" v-if="selectedCommand !== null || isCreatingNew">
          <div class="roskazCode">
            <textarea v-if="selectedCommand !== null && !editCommandEnabled" v-model="localList[selectedCommand].lines" disabled />
            <textarea v-else-if="selectedCommand !== null && editCommandEnabled" v-model="EditCommandField" />
            <textarea v-else v-model="newCommandLines" placeholder="Wpisz kod dla nowego rozkazu..." />
          </div>
        </div>

        <div class="actionButtons">
          <div class="top-actions" v-if="selectedCommand !== null">
            <button @click="deleteCommand" title="Usuń rozkaz" class="execution-btn execution-btn--run">
              <!-- ikona kosza -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6m4-6v6" />
                <path d="M15 6V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2" />
              </svg>
              <span>Usuń</span>
            </button>

            <button
              class="execution-btn execution-btn--run"
              @click="onEdit"
              :disabled="!canEdit || editCommandEnabled"
              title="Edytuj treść rozkazu"
            >
              <span>Edytuj</span>
            </button>

            <button
              class="execution-btn execution-btn--run"
              @click="onSave"
              :disabled="!editCommandEnabled"
              title="Zapisz zmiany"
            >
              <span>Zapisz</span>
            </button>
          </div>
          <div class="commandInputSection">
            <div class="unifiedCommandInput">
              <input
                type="text"
                v-model="commandInputValue"
                @keyup="handleKeyup"
                @keydown="handleKeydown"
                :placeholder="commandInputPlaceholder"
                class="commandInput"
              />
            </div>
            <div class="editingButtons" v-if="isEditingName">
              <button @click="confirmNameEdit" title="Potwierdź zmianę nazwy" class="execution-btn execution-btn--run">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" width="20" height="20" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Potwierdź</span>
              </button>
              <button @click="cancelNameEdit" title="Anuluj edycję" class="execution-btn execution-btn--run">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" width="20" height="20" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                <span>Anuluj</span>
              </button>
            </div>
            <button v-else-if="matchingCommand && !isEditingName" @click="startNameEdit" title="Edytuj nazwę rozkazu" class="execution-btn execution-btn--run">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" width="20" height="20" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Edytuj</span>
            </button>
            <button v-else @click="handleAddCommand" :disabled="!commandInputValue.trim()" title="Dodaj nowy rozkaz" class="execution-btn execution-btn--run">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" width="20" height="20" viewBox="0 0 24 24">
                <g stroke-width="2" stroke-linecap="round">
                  <path d="M12 16V8m4 4H8" />
                  <circle cx="12" cy="12" r="9" />
                </g>
              </svg>
              <span>Dodaj</span>
            </button>
          </div>

          <div class="fileActions">
            <button @click="loadCommandList" title="Wgraj listę rozkazów" class="execution-btn execution-btn--run">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" width="20" height="20" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v9m0-9l3 3m-3-3l-3 3m8.5 2c1.519 0 2.5-1.231 2.5-2.75a2.75 2.75 0 00-2.016-2.65A5 5 0 008.37 8.108a3.5 3.5 0 00-1.87 6.746"
                />
              </svg>
              <span>Wgraj</span>
            </button>
            <button @click="downloadCommandList" title="Pobierz listę rozkazów" class="execution-btn execution-btn--run">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" width="20" height="20" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 5v8.5m0 0l3-3m-3 3l-3-3M5 15v2a2 2 0 002 2h10a2 2 0 002-2v-2"
                />
              </svg>
              <span>Pobierz</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SegmentedToggle from './SegmentedToggle.vue'

export default {
  name: 'CommandList',
  components: {  SegmentedToggle },
  props: {
    visible: { type: Boolean, default: false },
    commandList: { type: Array, required: true },
    codeBits: { type: Number, default: 6 },
  },
  emits: ['update:commandList', 'close'],
  data() {
    return {
      localList: JSON.parse(JSON.stringify(this.commandList)),
      fullCommandList: JSON.parse(JSON.stringify(this.commandList)),
      selectedCommand: this.commandList.length > 0 ? 0 : null,
      editCommandEnabled: false,
      EditCommandField: '',
      commandInputValue: '',
      isAddingCommand: false,
      isCreatingNew: false,
      isEditingName: false,
      editingCommandOriginalName: '',
      newCommandLines: '',
    };
  },

  // there can be a situation where fullCommandList is deprecated after adding a new command
  // needs to be addressed, leaving due to the lack of time
  created() {
    this.fullCommandList = JSON.parse(JSON.stringify(this.commandList));
  },

  computed: {
    canEdit() { return this.selectedCommand !== null },
    commandInputPlaceholder() {
      if (this.isEditingName) {
        return `Edytuj nazwę z "${this.editingCommandOriginalName}"`;
      }
      if (this.matchingCommand) {
        return `Edytuj rozkaz: ${this.matchingCommand.name}`;
      }
      return 'Nazwa nowego rozkazu';
    },

    matchingCommand() {
      if (!this.commandInputValue.trim()) return null;

      // Normal matching
      const found = this.localList.find((cmd) => cmd.name.trim().toLowerCase() === this.commandInputValue.trim().toLowerCase());
      return found || null;
    },
  },
  watch: {
    commandList: {
      handler(newList) {
        if (this.isAddingCommand) {
          this.isAddingCommand = false;
          return;
        }

        this.localList = JSON.parse(JSON.stringify(newList));
        if (this.selectedCommand !== null && this.selectedCommand >= newList.length) {
          this.selectedCommand = newList.length > 0 ? newList.length - 1 : null;
        } else if (this.selectedCommand === null && newList.length > 0) {
          this.selectedCommand = 0;
        }
      },
      deep: true,
    },

    codeBits: {
      handler(newBits, oldBits) {
        const newMaxCommands = Math.pow(2, newBits);
        const oldMaxCommands = oldBits ? Math.pow(2, oldBits) : this.fullCommandList.length;

        if (newMaxCommands < oldMaxCommands) {
          // Bits decreased - trim visible list to new limit
          if (this.localList.length > newMaxCommands) {
            this.localList = this.localList.slice(0, newMaxCommands);

            // Adjust selected command if needed
            if (this.selectedCommand !== null && this.selectedCommand >= newMaxCommands) {
              this.selectedCommand = newMaxCommands > 0 ? newMaxCommands - 1 : null;
            }

            this.emitUpdate();
          }
        } else if (newMaxCommands > oldMaxCommands) {
          // Bits increased - restore instructions from full list up to new limit
          const commandsToRestore = Math.min(this.fullCommandList.length, newMaxCommands);
          this.localList = JSON.parse(JSON.stringify(this.fullCommandList.slice(0, commandsToRestore)));
          console.log(this.fullCommandList.length, this.localList.length, this.commandList.length);

          // Restore selected command if it was trimmed before
          if (this.selectedCommand === null && this.localList.length > 0) {
            this.selectedCommand = 0;
          }

          this.emitUpdate();
        }
      },
      immediate: false,
    },

    selectedCommand(newVal) {
      if (newVal === null) {
        return;
      }
      this.commandInputValue = this.localList[newVal].name;
      this.isCreatingNew = false;
    },

    matchingCommand(newCommand) {
      // Don't interfere when editing name
      if (this.isEditingName) return;

      if (newCommand) {
        // Found matching command - show its content
        const index = this.localList.findIndex((cmd) => cmd === newCommand);
        this.selectedCommand = index;
        this.isCreatingNew = false;
      } else if (this.commandInputValue.trim()) {
        // No matching command but input not empty - creating new
        this.selectedCommand = null;
        this.isCreatingNew = true;
        this.newCommandLines = '';
      } else {
        // Empty input
        this.selectedCommand = null;
        this.isCreatingNew = false;
      }
    },
    editCommandEnabled(val) {
      if (val) {
        this.EditCommandField = this.localList[this.selectedCommand]?.lines || '';
      } else if (this.selectedCommand !== null) {
        this.localList[this.selectedCommand].lines = this.EditCommandField;

        // Update the same command in fullCommandList
        const commandToUpdate = this.localList[this.selectedCommand];
        const fullListIndex = this.fullCommandList.findIndex((cmd) => cmd.name === commandToUpdate.name);
        if (fullListIndex !== -1) {
          this.fullCommandList[fullListIndex].lines = this.EditCommandField;
        }

        this.emitUpdate();
      }
    },
    localList: {
      handler(newList) {
        this.validateDuplicateNames();
      },
      deep: true,
    },
  },
  mounted() {
    if (this.localList.length === 0) {
      this.selectedCommand = null;
    } else if (this.selectedCommand === null) {
      this.selectedCommand = 0;
    }
  },
  methods: {
    onEdit() { this.editCommandEnabled = true },
    onSave() { this.editCommandEnabled = false },
    changeEditCommandEnabled(){ this.editCommandEnabled = !this.editCommandEnabled },
    validateDuplicateNames() {
      const names = this.localList.map((cmd) => cmd.name.trim()).filter((name) => name !== '');
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);

      if (duplicates.length > 0) {
        const uniqueDuplicates = [...new Set(duplicates)];
        console.warn(`Duplikaty nazw rozkazów: ${uniqueDuplicates.join(', ')}`);
      }
    },
    handleKeyup() {
      // This will trigger the matchingCommand watcher automatically
      // which handles the logic for showing/hiding content
    },
    handleKeydown(event) {
      if (!this.isEditingName) {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        this.confirmNameEdit();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.cancelNameEdit();
      }
    },
    cancelNameEdit() {
      this.commandInputValue = this.editingCommandOriginalName;
      this.isEditingName = false;
      this.editingCommandOriginalName = '';
    },
    startNameEdit() {
      if (!this.matchingCommand || !this.matchingCommand.name) {
        console.error('No matching command found or command has no name');
        alert('Błąd: nie znaleziono rozkazu do edycji');
        return;
      }

      this.isEditingName = true;
      this.editingCommandOriginalName = this.matchingCommand.name;
    },
    confirmNameEdit() {
      const newName = this.commandInputValue.trim();
      console.log('confirmNameEdit called with:', newName);

      if (newName === '') {
        alert('Nazwa rozkazu nie może być pusta!');
        this.commandInputValue = this.editingCommandOriginalName;
        return;
      }

      // Find the command we're editing
      const commandToEdit = this.localList.find((cmd) => cmd.name.trim().toLowerCase() === this.editingCommandOriginalName.toLowerCase());

      if (!commandToEdit) {
        alert('Błąd: nie znaleziono rozkazu do edycji');
        this.cancelNameEdit();
        return;
      }

      if (newName !== this.editingCommandOriginalName) {
        // Check for duplicates (excluding current command) in both lists
        const otherCommands = this.localList.filter((cmd) => cmd !== commandToEdit);
        const otherFullCommands = this.fullCommandList.filter(
          (cmd) => cmd.name.trim().toLowerCase() !== this.editingCommandOriginalName.toLowerCase()
        );

        const duplicate =
          otherCommands.find((cmd) => cmd.name.trim().toLowerCase() === newName.toLowerCase()) ||
          otherFullCommands.find((cmd) => cmd.name.trim().toLowerCase() === newName.toLowerCase());

        if (duplicate) {
          alert(`Rozkaz o nazwie "${newName}" już istnieje!`);
          this.commandInputValue = this.editingCommandOriginalName;
          return;
        }

        // Update the command name in local list
        commandToEdit.name = newName;

        // Update the same command in fullCommandList
        const fullListCommand = this.fullCommandList.find(
          (cmd) => cmd.name.trim().toLowerCase() === this.editingCommandOriginalName.toLowerCase()
        );
        if (fullListCommand) {
          fullListCommand.name = newName;
        }

        this.emitUpdate();
      }

      // Exit editing mode
      this.isEditingName = false;
      this.editingCommandOriginalName = '';

      // Update the selected command to the newly renamed one
      const newIndex = this.localList.findIndex((cmd) => cmd === commandToEdit);
      if (newIndex !== -1) {
        this.selectedCommand = newIndex;
      }
    },
    handleAddCommand() {
      if (this.localList.length >= Math.pow(2, this.codeBits)) {
        alert('Limit rozkazów osiągnięty');
        return;
      }

      const newCommandName = this.commandInputValue.trim();

      if (newCommandName === '') {
        alert('Nazwa rozkazu nie może być pusta!');
        return;
      }

      // Check if command already exists
      if (this.matchingCommand) {
        alert(`Rozkaz o nazwie "${newCommandName}" już istnieje!`);
        return;
      }

      const newCommand = {
        name: newCommandName,
        args: 0,
        description: `Rozkaz ${newCommandName}`,
        lines: this.newCommandLines || '',
      };

      this.localList.push(newCommand);
      this.fullCommandList.push(JSON.parse(JSON.stringify(newCommand)));

      const newIndex = this.localList.length - 1;
      this.selectedCommand = newIndex;
      this.isCreatingNew = false;
      this.newCommandLines = '';

      this.isAddingCommand = true;
      this.emitUpdate();

      this.$nextTick(() => {
        const commandButtons = document.querySelectorAll('#commandListTable > button');
        if (commandButtons[newIndex]) {
          commandButtons[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    },

    loadCommandList() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.lst,.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const parsed = JSON.parse(ev.target.result);

            // Apply current codeBits limit when loading
            const maxCommands = Math.pow(2, this.codeBits);
            this.fullCommandList = parsed; // Store complete loaded list
            this.localList = parsed.slice(0, maxCommands); // Show only up to current limit

            if (this.localList.length > 0) {
              this.selectedCommand = 0;
              this.editCommandEnabled = false;
            } else {
              this.selectedCommand = null;
            }

            this.emitUpdate();
          } catch {
            alert('Błąd wczytywania listy');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },
    downloadCommandList() {
      const data = JSON.stringify(this.fullCommandList, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'commandList.json';
      a.click();
      URL.revokeObjectURL(url);
    },
    editCommand(index) {
      this.selectedCommand = index;
      this.editCommandEnabled = false;
    },
    deleteCommand() {
      if (this.selectedCommand === null) return;

      const commandToDelete = this.localList[this.selectedCommand];

      // Remove from local list
      this.localList.splice(this.selectedCommand, 1);

      // Remove from full list as well
      const fullListIndex = this.fullCommandList.findIndex(
        (cmd) => cmd.name === commandToDelete.name && cmd.lines === commandToDelete.lines
      );
      if (fullListIndex !== -1) {
        this.fullCommandList.splice(fullListIndex, 1);
      }

      this.emitUpdate();
      this.selectedCommand = this.localList.length ? Math.min(this.selectedCommand, this.localList.length - 1) : null;
    },
    emitUpdate() {
      const names = this.localList.map((cmd) => cmd.name.trim()).filter((name) => name !== '');
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);

      if (duplicates.length > 0) {
        const uniqueDuplicates = [...new Set(duplicates)];
        alert(`Nie można zapisać - znaleziono duplikaty nazw rozkazów: ${uniqueDuplicates.join(', ')}`);
        return;
      }

      this.$emit('update:commandList', JSON.parse(JSON.stringify(this.localList)));
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
}
#commandList {
  z-index: 100;
  display: grid;
  grid-template-areas:
    'header header'
    'list right-panel';
  grid-template-rows: auto 1fr;
  grid-template-columns: 250px 1fr;
  gap: 1rem;
  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
  color: var(--fontColor, black);
  border-radius: var(--default-border-radius, 0.25rem);
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
  padding: 1rem;
  overflow: hidden;
  resize: both;
  width: 800px;
  max-width: 90vw;
  height: 90vh;
}

@media (max-width: 675px) {
  #commandList {
    grid-template-areas:
    'header header'
    'right-panel right-panel'
    'list list';
    grid-template-rows: auto auto auto;
    grid-template-columns: autos;
  }
}

body.darkMode #commandList {
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.8);
}

.header {
  grid-area: header;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 0 0 1rem 0;
  border-bottom: 1px solid var(--panelOutlineColor, black);
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  text-align: center;
  color: var(--fontColor, black);
}

.closeButton {
  position: absolute;
  right: 0;
  top: 0%;
}

#commandListTable {
  grid-area: list;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}

#commandListTable > span {
  color: var(--fontColor, black);
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
}

body.darkMode #commandListTable > button:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

body.darkMode #commandListTable > button.selected {
  box-shadow: 0 2px 8px rgba(74, 158, 255, 0.4);
}

.right-panel {
  grid-area: right-panel;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 0.5rem;
  min-width: 0;
}

#commandDetails {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
}

#commandDetails > .buttons {
  display: none;
}

#commandDetails .roskazCode {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  flex-grow: 1;
}

#commandDetails .roskazCode textarea {
  margin: 5px;
  width: 100%;
  flex-grow: 1;
  min-height: 150px;
  resize: none;
  padding: 0.75rem;
  background-color: var(--panelBackgroundColor, white);
  color: var(--fontColor, black);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  transition: all 0.2s ease;
}

#commandDetails .roskazCode textarea:focus {
  outline: none;
  border-color: #003c7d;
  box-shadow: 0 0 0 2px #003c7d;
}

body.darkMode #commandDetails .roskazCode textarea:focus {
  box-shadow: 0 0 0 2px #003c7d;
}

#commandDetails .roskazCode textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--buttonBackgroundColor, #f5f5f5);
}

body.darkMode #commandDetails .roskazCode textarea:disabled {
  opacity: 0.5;
}

.actionButtons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}


.top-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 675px) {
  .top-actions {
    justify-content: center;
    gap: 0.5rem;
  }
}

.top-actions > button{
  height: 20px ;
}

.top-actions > button:first-child:hover {
  background: #ff4444;
  color: white;
  border-color: #ff4444;
}

.commandInputSection {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.unifiedCommandInput {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}

.editingButtons {
  display: flex;
  gap: 0.5rem;
}

.commandInput {
  flex: 1;
  margin-left: 5px;
  padding: 1rem;
  border: 1px solid var(--panelOutlineColor, black);
  border-radius: 4px;
  background-color: var(--panelBackgroundColor, white);
  color: var(--fontColor, black);
  font-size: 14px;
  transition: all 0.2s ease;
}

@media (max-width: 675px) {
  .commandInputSection {
    gap: 1rem;
    justify-content: end;
    flex-wrap: wrap;
  }
}

.commandInput:focus {
  outline: none;
  border-color: #003c7d;
  box-shadow: 0 0 0 2px #003c7d;
}

body.darkMode .commandInput:focus {
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.3);
}

.fileActions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.actionButtons button svg {
  width: 20px;
  height: 20px;
}

.actionButtons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--buttonBackgroundColor, white) !important;
  color: #999 !important;
  border-color: #ddd !important;
  transform: none;
  box-shadow: none;
}

body.darkMode .commandInputSection button:hover,
body.darkMode .fileActions button:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
