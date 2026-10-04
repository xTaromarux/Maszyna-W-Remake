import type { Machine, SelectorMethods } from '@/types/simulator';
export const machineSelectors: SelectorMethods & ThisType<Machine> = {
  anyPopupOpen() {
    return this.commandListOpen || this.aiChatOpen || this.settingsOpen;
  },

  globalBackdropOpen() {
    return this.commandListOpen || this.settingsOpen;
  },

  localizedLabCatalog() {
    return this.labCatalog.map((lab) => ({
      ...lab,
      title: this.t(lab.titleKey),
      description: this.t(lab.descriptionKey),
      outcomes: (lab.outcomesKeys || []).map((key) => this.t(key)),
    }));
  },

  selectedLab() {
    return this.labCatalog.find((lab) => lab.id === this.selectedLabId) || this.labCatalog[0] || null;
  },

  rint() {
    const active = this.RZ & ~this.RM;
    return active !== 0;
  },

  highestPriorityIRQ() {
    const active = this.RZ & ~this.RM;
    if (!active) return null;

    for (let i = 3; i >= 0; i--) {
      if (active & (1 << i)) {
        return i + 1;
      }
    }
    return null;
  },
};
