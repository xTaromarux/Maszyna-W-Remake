<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 475 439"
    preserveAspectRatio="xMidYMid meet"
    class="customIcon"
  >
    <g
      :transform="`translate(0, ${viewBoxHeight}) scale(0.1,-0.1)`"
      :fill="fillColor"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      stroke-linejoin="round"
      stroke-linecap="round"
    >
            <path d="M1465 3800 c-176 -24 -338 -132 -424 -283 -35 -62 -71 -176 -71 -223
            l0 -34 69 0 68 0 7 49 c16 120 117 251 241 312 l70 34 1125 0 1125 0 70 -34
            c90 -44 162 -116 206 -206 l34 -70 0 -1130 0 -1130 -34 -70 c-44 -90 -116
            -162 -206 -206 l-70 -34 -1104 -3 c-964 -2 -1111 0 -1157 13 -69 20 -171 89
            -209 142 l-30 42 -83 0 -83 1 28 -51 c68 -122 186 -218 328 -267 l80 -27 1105
            0 1105 0 80 27 c189 65 317 196 377 388 l23 75 0 1100 0 1100 -23 75 c-60 192
            -188 323 -377 388 l-80 27 -1065 1 c-586 1 -1092 -2 -1125 -6z" />
            <path d="M875 2848 c-202 -553 -505 -1393 -505 -1399 0 -5 56 -9 124 -9 l124
            0 26 73 c15 39 46 131 70 202 l43 130 236 3 235 2 69 -205 68 -205 128 0 c118
            0 129 1 124 18 -3 14 -487 1321 -512 1385 -6 15 -22 17 -116 17 -79 0 -111 -4
            -114 -12z m202 -550 l81 -223 -84 -3 c-46 -1 -121 -1 -167 0 l-83 3 79 223
            c44 122 83 222 87 222 4 0 43 -100 87 -222z" />
            <path d="M1720 2150 l0 -710 115 0 115 0 0 710 0 710 -115 0 -115 0 0 -710z" />
    </g>
  </svg>
</template>
<script setup>
const props = defineProps({
  fillColor: {
    type: String,
    default: 'currentColor'
  },
  strokeColor: {
    type: String,
    default: 'none'
  },
  strokeWidth: {
    type: [Number, String],
    default: 0
  }
})
const viewBoxHeight = 439
</script>
<style scoped>
.customIcon {
  display: inline-block;
  vertical-align: middle;
  margin-top: 2px;
  width: 35px;
  height: 30px;
}
</style>