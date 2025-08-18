<template>
  <div
    id="creators"
    :class="{ 'slide-in-left': isAnimated, 'slide-out-left': !isAnimated }"
    @click.stop
    aria-label="Twórcy projektu"
  >
    <header class="creatorsHeader">
        <h1>Twórcy</h1>
    </header>

    <div class="creatorsContent">
      <div class="creators-list">
        <div v-for="(c, idx) in creators" :key="idx" class="creatorItem">
          <span class="creatorName">{{ c.name }}</span>

          <div v-if="c.roles?.length" class="creator-roles">
            <span v-for="(r, i) in c.roles" :key="i" class="creator-role">{{ r }}</span>
          </div>

          <div class="creator-links">
            <a
              v-if="c.linkedin"
              :href="c.linkedin"
              target="_blank"
              rel="noopener noreferrer"
              class="icon-link"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <LinkedInIcon />
            </a>
            <a
              v-if="c.github"
              :href="c.github"
              target="_blank"
              rel="noopener noreferrer"
              class="icon-link"
              aria-label="GitHub"
              title="GitHub"
            >
              <GitHubIcon />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LinkedInIcon from '@/assets/svg/LinkedInIcon.vue'
import GitHubIcon from '@/assets/svg/GitHubIcon.vue'

export default {
  name: 'CreatorsPanel',
  components: { LinkedInIcon, GitHubIcon },
  props: {
    isAnimated: { type: Boolean, default: false },
    creators: {
      type: Array,
      default: () => [],
    },
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
  color: #FFF;
  margin: 0;
}

.creatorsContent { flex: 1; overflow-y: auto; padding: .75rem 1rem 1rem 1rem; display: flex; flex-direction: column }

.creators-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px,1fr));
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
}
.creatorItem {
  padding: 8px 12px;
  border: 1px sold black;
  background: rgba(255,255,255,0.08);
  border-radius: 6px;
  font-size: .9em;
  text-align: center;
  color: #000;
  transition: .2s;
  display:flex; flex-direction:column; align-items:center; gap:6px;
}
.creatorItem:hover { background: rgba(255,255,255,0.15); transform: translateY(-1px) }
.creatorName { font-weight: 500; line-height: 1.2; color: 000; }

.creator-links { display:flex; justify-content:center; gap:8px }
.icon-link { display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; color:#aaa; transition:.2s; border-radius:4px; padding:2px }
.icon-link:hover { color:#fff; background:rgba(255,255,255,0.1); transform: scale(1.1) }

.creator-roles { display:flex; gap:6px; flex-wrap:wrap }
.creator-role { font-size:.75rem; opacity:.85; padding:2px 6px; border-radius:999px; border:1px solid rgba(255,255,255,0.15) }
</style>
