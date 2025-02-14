<!-- maxi flem de coder cette merde, j'ai pas le temps et c'est pas une partie importante du projet, donc merci Copilote-->

<template>
  <div class="mordjen-container" @click="playVideo">
    <video
      ref="videoPlayer"
      src="../assets/mordjen.mp4"
      class="fullscreen-video"
      muted
      @ended="goHome"
    ></video>
    <div v-if="!isPlaying" class="play-overlay">Click to Play with Grégoire LaGoutte</div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    return { router }
  },
  data() {
    return {
      isPlaying: false,
    }
  },
  methods: {
    playVideo() {
      const video = this.$refs.videoPlayer
      video.muted = false
      video.play()
      this.isPlaying = true
    },
    goHome() {
      this.router.push('/')
    },
  },
}
</script>

<style scoped>
.mordjen-container {
  /* bahahahah mordjen-container av bien te faire enculer copilote */
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: black;
  cursor: pointer;
}

.fullscreen-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.5rem;
  background: rgba(0, 0, 0, 0.7);
  padding: 1rem 2rem;
  border-radius: 8px;
}
</style>
