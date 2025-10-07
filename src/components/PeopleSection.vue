<template>
  <section v-if="isMobile" class="people-section">
    <header class="creatorsHeader">
      <h1>{{ title }}</h1>
    </header>
    <div class="creatorsContent">
        <div class="creatorsList" :style="{ '--cols': columns }">
            <div v-for="(p, idx) in people" :key="idx" class="creatorItem">
                <span class="creatorName">{{ p.name }}</span>
                <div v-if="p.roles?.length" class="creatorRoles">
                    <span v-for="(r, i) in p.roles" :key="i" class="creatorRole">{{ r }}</span>
                </div>
                <div class="creatorLinks">
                    <a v-if="p.linkedin" :href="p.linkedin" target="_blank" rel="noopener noreferrer" class="iconLink" aria-label="LinkedIn" title="LinkedIn">
                    <LinkedInIcon />
                    </a>
                    <a v-if="showGithub && p.github" :href="p.github" target="_blank" rel="noopener noreferrer" class="iconLink" aria-label="GitHub" title="GitHub">
                    <GitHubIcon />
                    </a>
                </div>
            </div>
        </div>
    </div>
  </section>
</template>
<script>
import LinkedInIcon from '@/assets/svg/LinkedInIcon.vue'
import GitHubIcon from '@/assets/svg/GitHubIcon.vue'
export default {
  name: 'PeopleSection',
  components: { LinkedInIcon, GitHubIcon },
  props: {
    title: { type: String, required: true },
    isMobile: { type: Boolean, required: false, default: true },
    people: { type: Array, default: () => [] },
    showGithub: { type: Boolean, default: true },
    columns: { type: Number, default: 2 },
  },
}
</script>
<style scoped>
.creatorsContent {
  flex: 1;
  overflow: visible;
  padding: .5rem 1rem 0.75rem 1rem;
  display: flex; flex-direction: column;
}
.creatorsList {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
  padding: 8px;
  background-color: var(--backgroundColorItem);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  align-items: stretch;
}
.creatorItem {
  height: 100%;
  padding: 8px 10px;
  background-color: var(--panelBackgroundColor);
  border-radius: 6px;
  font-size: .9em;
  text-align: center;
  color: #000;
  transition: .2s;
  display:flex; flex-direction:column; align-items:center; gap:6px;
}
.creatorItem:hover { background: rgba(255,255,255,0.15); transform: translateY(-1px) }
.creatorName { font-weight: 600; line-height: 1.2; color: var(--fontColor); }
.creatorRoles { display:flex; gap:4px; flex-wrap:wrap; justify-content:center }
.creatorRole { font-size:.72rem; opacity:.85; padding:1px 6px; border-radius:999px; border:1px solid rgba(255,255,255,0.15) }
.creatorLinks { display:flex; justify-content:center; gap:6px; margin-top: 2px; }
.iconLink { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; color:#666; transition:.2s; border-radius:4px; padding:2px }
.iconLink:hover { color:#fff; background:rgba(255,255,255,0.1); transform: scale(1.06) }
.creatorsHeader {
  display: flex;
  height: 56px;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #003c7d;
  color: #fff;
}
.creatorsHeader h1 {
  font-size: 1.25rem;
  color: #fff;
  margin: 0;
}
@media (max-width: 340px) {
  .creatorsList { grid-template-columns: repeat(1, minmax(0, 1fr)); }
}
.people-section + .people-section { margin-top: 10px; }
</style>