<template>
  <div
    v-if="!isMobile"
    id="creators"
    :class="{ 'slide-in-left': isAnimated, 'slide-out-left': !isAnimated }"
    @click.stop
    aria-label="Twórcy projektu"
  >
    <PeopleSection title="Opiekunowie" :people="caregivers" :showGithub="false" :columns="2" />
    <PeopleSection title="Twórcy" :people="creators" :showGithub="true" :columns="2" />
  </div>
</template>
<script>
import PeopleSection from './PeopleSection.vue'
export default {
  name: 'CreatorsPanel',
  components: { PeopleSection },
  props: {
    isMobile: { type: Boolean, default: false },
    isAnimated: { type: Boolean, default: false },
    creators: { type: Array, default: () => [] },
    caregivers: { type: Array, default: () => [] },
  },
}
</script>
<style scoped>
#creators {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 360px;
  max-width: 85vw;
  z-index: 101;
  background-color: var(--panelBackgroundColor);
  border-right: 1px solid var(--panelOutlineColor);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  display: flex; flex-direction: column;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
#creators.slide-in-left { transform: translateX(0) }
#creators.slide-out-left { transform: translateX(-100%) }
</style>