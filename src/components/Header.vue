<template>
  <header class="main-header">
    <div class="header-content">
      <RouterLink to="/" class="logo">
        <img src="../assets/logo.png" alt="SkinFolio" />
      </RouterLink>
      <button @click="handlePortfolioClick" class="portfolio-btn">
        {{ store.steamId ? 'Mon Portfolio' : 'Connectez-vous' }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventaire'

defineOptions({
  name: 'PageHeader',
})

const router = useRouter()
const store = useInventoryStore()

const handlePortfolioClick = () => {
  if (store.steamId) {
    router.push('/inventory')
  } else {
    router.push('/#login-section')
  }
}
</script>

<style scoped>
.main-header {
  background: rgba(33, 33, 33, 0.95);
  backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo img {
  height: 40px;
  width: auto;
}

.portfolio-btn {
  background: #4b69ff;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.portfolio-btn:hover {
  background: #5d78ff;
  transform: translateY(-2px);
}
</style>
