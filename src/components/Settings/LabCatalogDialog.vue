<template>
  <div v-if="visible" class="labDialogBackdrop" @click.self="$emit('close')">
    <section class="labDialog" role="dialog" aria-modal="true" aria-label="Lab selector dialog">
      <header class="labDialogHeader">
        <h2>Wybierz lab</h2>
        <button class="closeBtn" type="button" @click="$emit('close')" aria-label="Close lab dialog">&times;</button>
      </header>

      <div class="labDialogBody">
        <aside class="labList">
          <button
            v-for="lab in labs"
            :key="lab.id"
            type="button"
            class="labListItem"
            :class="{ active: lab.id === selectedLabId }"
            @click="$emit('select-lab', lab.id)"
          >
            <span class="labListItemTitle">{{ lab.title }}</span>
          </button>
        </aside>

        <article class="labDetails" v-if="selectedLab">
          <h3>{{ selectedLab.title }}</h3>
          <p>{{ selectedLab.description }}</p>

          <h4>Czego nauczysz sie na tym labie</h4>
          <ul class="labOutcomeList">
            <li v-for="item in selectedLab.outcomes" :key="item">{{ item }}</li>
          </ul>

          <h4>Pythonowy overview</h4>
          <pre class="pythonPreview"><code>{{ selectedLab.pythonOverview }}</code></pre>
        </article>
      </div>

      <footer class="labDialogFooter">
        <button class="SvgAndTextButton compact-button execution-btn execution-btn--step" type="button" @click="$emit('load-lab')">
          Zaladuj lab
        </button>
      </footer>
    </section>
  </div>
</template>

<script>
export default {
  name: 'LabCatalogDialog',
  props: {
    visible: { type: Boolean, default: false },
    labs: { type: Array, default: () => [] },
    selectedLabId: { type: String, default: '' },
  },
  emits: ['close', 'select-lab', 'load-lab'],
  computed: {
    selectedLab() {
      return this.labs.find((lab) => lab.id === this.selectedLabId) || this.labs[0] || null;
    },
  },
};
</script>

<style scoped>
.labDialogBackdrop {
  position: fixed;
  inset: 0;
  z-index: 220;
  background: rgba(10, 14, 22, 0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.labDialog {
  width: min(1000px, 95vw);
  max-height: 88vh;
  overflow: hidden;
  border: 1px solid var(--panelOutlineColor);
  border-radius: var(--default-border-radius);
  background: var(--panelBackgroundColor);
  color: var(--fontColor);
  display: grid;
  grid-template-rows: auto 1fr auto;
  box-shadow:
    0 24px 44px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.labDialogHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #003c7d;
  color: #fff;
  padding: 0.8rem 1rem;
}

.labDialogHeader h2 {
  margin: 0;
  font-size: 1.05rem;
}

.closeBtn {
  border: none;
  background: transparent;
  color: #fff;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
}

.labDialogBody {
  min-height: 0;
  display: grid;
  grid-template-columns: 280px 1fr;
}

.labList {
  border-right: 1px solid var(--panelOutlineColor);
  overflow: auto;
  padding: 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.labListItem {
  width: 100%;
  text-align: left;
  border: 1px solid var(--panelOutlineColor);
  background: var(--buttonBackgroundColor);
  color: var(--buttonTextColor);
  border-radius: var(--default-border-radius);
  padding: 0.65rem 0.75rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.labListItem:hover {
  background: var(--buttonHoverColor);
}

.labListItem.active {
  border-color: #0056b3;
  background: rgba(0, 86, 179, 0.18);
}

.labListItemTitle {
  font-weight: 600;
}

.labDetails {
  overflow: auto;
  padding: 1rem;
  text-align: left;
}

.labDetails h3 {
  margin: 0 0 0.45rem 0;
}

.labDetails h4 {
  margin: 0.95rem 0 0.4rem 0;
}

.labDetails p {
  margin: 0;
  line-height: 1.45;
}

.labOutcomeList {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.pythonPreview {
  margin: 0;
  border: 1px solid var(--panelOutlineColor);
  border-radius: var(--default-border-radius);
  background: rgba(7, 12, 20, 0.95);
  color: #dce8ff;
  padding: 0.8rem;
  overflow: auto;
  line-height: 1.45;
  font-size: 0.86rem;
}

.labDialogFooter {
  border-top: 1px solid var(--panelOutlineColor);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: flex-end;
}

.SvgAndTextButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 1rem;
  border: 1px solid var(--panelOutlineColor);
  border-radius: var(--default-border-radius);
  background: var(--buttonBackgroundColor);
  color: var(--buttonTextColor);
  cursor: pointer;
  transition: 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.SvgAndTextButton:hover {
  background: var(--buttonHoverColor);
  transform: translateY(-1px);
}

.SvgAndTextButton:active {
  background: var(--buttonActiveColor);
  transform: translateY(0);
}

.compact-button {
  min-width: 130px;
}

@media (max-width: 900px) {
  .labDialog {
    width: min(1000px, 96vw);
    max-height: 92vh;
  }

  .labDialogBody {
    grid-template-columns: 1fr;
    grid-template-rows: 180px 1fr;
  }

  .labList {
    border-right: 0;
    border-bottom: 1px solid var(--panelOutlineColor);
  }
}
</style>
