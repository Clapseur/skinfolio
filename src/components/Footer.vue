<template>
  <footer>
    <div class="footer-container">
      <div class="footer-left">
        <img src="../assets/logo.png" alt="Logo" class="footer-logo" />
      </div>

      <nav class="footer-nav">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink v-if="hasSessionId" to="/inventory"> Inventory </RouterLink>
      </nav>

      <div class="footer-right">
        <p class="copyright">© 2025 Clapseur</p>
        <RouterLink to="/mordjen" class="mordjen-btn">El Mordjen</RouterLink>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ref, onMounted } from 'vue'

// Rename component to satisfy linter
defineOptions({
  name: 'PageFooter',
})

const hasSessionId = ref(false)

onMounted(() => {
  const sessionId = localStorage.getItem('sessionId')
  hasSessionId.value = !!sessionId
})
</script>

<style scoped>
footer {
  background-color: #212121;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-logo {
  height: 100px;
  width: auto;
}

.footer-nav {
  display: flex;
  gap: 2rem;
}

.footer-nav a {
  color: #999;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-nav a:hover {
  color: #4b69ff;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.copyright {
  color: #666;
  margin: 0;
}

.mordjen-btn {
  background: #4b69ff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition:
    transform 0.2s,
    background-color 0.2s;
}

.mordjen-btn:hover {
  background: #5d78ff;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .footer-nav {
    flex-wrap: wrap;
    justify-content: center;
  }

  .footer-right {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
