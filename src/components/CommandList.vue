<template>
    <div id="commandList" v-if="visible">
      <div class="flexRow">
        <span>Lista Rozkazów</span>
        <button @click="addCommand" title="Dodaj rozkaz">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" width="24" height="24" viewBox="0 0 24 24">
            <g stroke-width="2" stroke-linecap="round">
              <path d="M12 16V8m4 4H8"/>
              <circle cx="12" cy="12" r="9"/>
            </g>
          </svg>
          <span>Dodaj</span>
        </button>
        <button @click="loadCommandList" title="Wgraj listę rozkazów">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" width="24" height="24" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 10v9m0-9l3 3m-3-3l-3 3m8.5 2c1.519 0 2.5-1.231 2.5-2.75a2.75 2.75 0 00-2.016-2.65A5 5 0 008.37 8.108a3.5 3.5 0 00-1.87 6.746"/>
          </svg>
          <span>Wgraj</span>
        </button>
        <button @click="downloadCommandList" title="Pobierz listę rozkazów">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" width="24" height="24" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 5v8.5m0 0l3-3m-3 3l-3-3M5 15v2a2 2 0 002 2h10a2 2 0 002-2v-2"/>
          </svg>
          <span>Pobierz</span>
        </button>
      </div>
  
      <div id="commandListTable">
        <span>{{ commandList.length }} / {{ Math.pow(2, codeBits) }}</span>
        <button
          v-for="(cmd, idx) in commandList"
          :key="idx"
          @click="editCommand(idx)"
          class="command"
        >
          <span>{{ cmd.name }}</span>
        </button>
      </div>
  
      <div id="commandDetails" v-if="selectedCommand !== null">
        <div class="buttons">
          <input type="text" v-model="localList[selectedCommand].name" />
          <button @click="deleteCommand" title="Usuń rozkaz">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6m4-6v6"/>
              <path d="M15 6V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2"/>
            </svg>
            <span>Usuń</span>
          </button>
          <div class="switchDiv">
            <input id="editCommandToggle" type="checkbox" v-model="editCommandEnabled" />
            <label for="editCommandToggle">
              {{ editCommandEnabled ? 'Zapisz' : 'Edytuj' }}
            </label>
          </div>
        </div>
  
        <div class="roskazCode">
          <textarea
            v-if="!editCommandEnabled"
            v-model="localList[selectedCommand].lines"
            disabled
          />
          <textarea
            v-else
            v-model="EditCommandField"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CommandList',
    props: {
      visible: { type: Boolean, default: false },
      commandList: { type: Array, required: true },
      codeBits: { type: Number, default: 6 },
    },
    emits: ['update:commandList'],
    data() {
      return {
        localList: JSON.parse(JSON.stringify(this.commandList)),
        selectedCommand: 0,
        editCommandEnabled: false,
        EditCommandField: '',
      };
    },
    watch: {
      commandList: {
        handler(newList) {
          this.localList = JSON.parse(JSON.stringify(newList));
        },
        deep: true,
      },
      editCommandEnabled(val) {
        if (val) {
          // rozpocznij edycję
          this.EditCommandField = this.localList[this.selectedCommand]?.lines || '';
        } else if (this.selectedCommand !== null) {
          // zakończ edycję i zapisz zmiany
          this.localList[this.selectedCommand].lines = this.EditCommandField;
          this.emitUpdate();
        }
      },
    },
    methods: {
      addCommand() {
        if (this.localList.length >= Math.pow(2, this.codeBits)) {
          alert('Limit rozkazów osiągnięty');
          return;
        }
        this.localList.push({ name: 'new', args: 0, description: 'new command', lines: '' });
        this.emitUpdate();
        this.selectedCommand = this.localList.length - 1;
        this.editCommandEnabled = true;
      },
      loadCommandList() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.lst,.json';
        input.onchange = e => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = ev => {
            try {
              const parsed = JSON.parse(ev.target.result);
              this.localList = parsed;
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
        const data = JSON.stringify(this.localList, null, 2);
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
        this.localList.splice(this.selectedCommand, 1);
        this.emitUpdate();
        this.selectedCommand = this.localList.length ? Math.min(this.selectedCommand, this.localList.length - 1) : null;
      },
      emitUpdate() {
        this.$emit('update:commandList', JSON.parse(JSON.stringify(this.localList)));
      },
    },
  };
  </script>
  
  <style scoped>
  #commandList {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  z-index: 100;

  display: grid;
  grid-template-areas:
    "fr fr"
    "list details";
  grid-template-columns: auto 2fr;
  grid-template-rows: auto 1fr;
  gap: 0.5rem;
  justify-content: stretch;
  align-content: stretch;

  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);

  border-radius: var(--default-border-radius, 0.25rem);
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);

  padding: 1rem;

  overflow: hidden;
  resize: both;
}

#commandList button {
  padding: 0.25rem;
}

#commandList button svg {
  width: 1.5rem;
  height: 1.5rem;
}

#commandList .flexRow {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;

  grid-area: fr;
}

#commandList #commandListTable {
  grid-area: list;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

#commandList #commandListTable>button {
  all: unset;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 1rem 0.25rem 0.25rem;
  cursor: pointer;
}

#commandList #commandListTable>button:not(:last-child) {
  border-bottom: 1px solid var(--panelOutlineColor, black);
}

#commandList #commandListTable>button:hover {
  background-color: #fff8;
}

#commandList #commandListTable>button:active {
  background-color: #00aaff;
  color: white;
}

#commandList #commandDetails {
  grid-area: details;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  justify-content: stretch;
  align-content: stretch;
  overflow-y: auto;
}

#commandList #commandDetails>.buttons {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  padding: 0.25rem;
}

#commandList #commandDetails .roskazCode {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.25rem;
  justify-content: stretch;
  align-items: stretch;
}

#commandList #commandDetails .roskazCode textarea {
  width: 100%;
  height: 100%;
  resize: none;
  padding: 0.5rem;

  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
}
  </style>
  