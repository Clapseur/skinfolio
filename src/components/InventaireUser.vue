<script setup>
import Footer from './Footer.vue'
import { ref, onMounted, watch, computed } from 'vue'
import { useInventoryStore } from '@/stores/inventaire'
import { Chart, registerables } from 'chart.js'
import Graph from './Graph.vue'

Chart.register(...registerables)

const weaponrarity = [
  { name: 'Consumer Grade', color: 'b0c3d9', id: '1' },
  { name: 'Industrial Grade', color: '5e98d9', id: '2' },
  { name: 'Mil-Spec', color: '4b69ff', id: '3' },
  { name: 'Restricted', color: '8847ff', id: '4' },
  { name: 'Classified', color: 'd32ce6', id: '5' },
  { name: 'Covert', color: 'eb4b4b', id: '6' },
  { name: 'Contreband', color: 'e4ae39', id: '7' },
]

const inventoryStore = useInventoryStore()
const selectedItem = ref(null)
const showMenu = ref(false)
const searchName = ref('')
const priceRange = ref([0, 10000])
const sortOrder = ref('asc')
const filterStatTrak = ref(false)
const filterStarred = ref(false)
const currentPage = ref(1)
const itemsPerPage = 20
const isLoading = ref(false)
const selectedRarities = ref([])

const chartData = ref({
  // !! changer les valeurs du chartjs dans l'app.vue
  labels: ['7 Days', '14 Days', '30 Days', '60 Days'],
  datasets: [
    {
      label: 'Item Price History',
      data: [0, 0, 0, 0],
      borderColor: '#4b69ff',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(75, 105, 255, 0.1)',
    },
  ],
})

const chartOptions = ref({
  responsive: true,
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart',
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: '#ffffff',
      },
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: '#ffffff',
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: '#ffffff',
      },
    },
  },
})

const chartRef = ref(null)
let priceChart = null

const paginatedInventory = computed(() => {
  const filteredItems = filterItems(inventoryStore.inventory)
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filteredItems.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  const filteredItems = filterItems(inventoryStore.inventory || [])
  return Math.ceil(filteredItems.length / itemsPerPage)
})

const getPageNumbers = computed(() => {
  const pages = []
  const currentPageNum = currentPage.value

  pages.push(1)

  const start = Math.max(2, currentPageNum - 2)
  const end = Math.min(totalPages.value - 1, currentPageNum + 2)

  if (start > 2) {
    pages.push('...')
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < totalPages.value - 1) {
    pages.push('...')
  }

  if (totalPages.value > 1) {
    pages.push(totalPages.value)
  }

  return pages
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

watch([searchName, priceRange], () => {
  currentPage.value = 1
})

onMounted(() => {
  inventoryStore.fetchInventory()

  setTimeout(() => {
    inventoryStore.inventory?.forEach((item, index) => {
      if (item.color) {
        document.documentElement.style.setProperty(`--item-color-${index}`, `#${item.color}`)
      }
    })
  }, 500)

  watch(
    () => selectedItem.value,
    (newItem) => {
      if (newItem && chartRef.value) {
        if (priceChart) {
          priceChart.destroy()
        }

        const ctx = chartRef.value.getContext('2d')
        priceChart = new Chart(ctx, {
          type: 'line',
          data: chartData.value,
          options: chartOptions.value,
        })
      }
    },
  )
})

const handleCardClick = (item) => {
  selectedItem.value = item
}

const closeDiv = () => {
  selectedItem.value = null
}

const handleClickOutside = (event) => {
  if (event.target.classList.contains('overlay')) {
    closeDiv()
  }
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const sortByRarity = () => {
  if (!inventoryStore.inventory) return

  const colorOrder = {
    b0c3d9: 1, // Grey (Consumer)
    '5e98d9': 2, // Light Blue (Industrial)
    '4b69ff': 3, // Blue (Mil-Spec)
    '8847ff': 4, // Purple (Restricted)
    d32ce6: 5, // Pink (Classified)
    eb4b4b: 6, // Red (Covert)
    e4ae39: 7, // Yellow (Contraband)
  }

  inventoryStore.inventory.sort((a, b) => {
    const colorA = colorOrder[a.color] || 0
    const colorB = colorOrder[b.color] || 0

    return sortOrder.value === 'asc' ? colorA - colorB : colorB - colorA
  })

  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const sortByPrice = () => {
  inventoryStore.inventory.sort((a, b) => b.buyorderprice - a.buyorderprice)
}

const filterItems = (items) => {
  if (!items) return []
  let filteredItems = items

  if (selectedRarities.value.length > 0) {
    filteredItems = filteredItems.filter((item) => selectedRarities.value.includes(item.rarity))
  }

  if (searchName.value) {
    filteredItems = filteredItems.filter((item) =>
      item.markethashname.toLowerCase().includes(searchName.value.toLowerCase()),
    )
  }

  if (filterStatTrak.value) {
    filteredItems = filteredItems.filter((item) => item.markethashname.includes('StatTrak™'))
  }

  if (filterStarred.value) {
    filteredItems = filteredItems.filter((item) => item.markethashname.includes('★'))
  }

  return filteredItems
}

const formatItemName = (name) => {
  // First split the name into StatTrak and rest of the name
  const parts = name.split('StatTrak™')
  if (parts.length === 1) return name // No StatTrak™ in name

  return `<span class="stattrak">StatTrak™</span>${parts[1]}`
}

const totalInventoryPrice = computed(() => {
  if (!inventoryStore.inventory) return 0
  return inventoryStore.inventory
    .reduce((total, item) => {
      return total + (item.buyorderavg || 0)
    }, 0)
    .toFixed(2)
})

const FormatedTotalPrice = computed(() => {
  return totalInventoryPrice.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') // regex de con qui te met tout les 3 chiffres un espace, a chnager pour une virgule si necessaire
})

const SellCurrentSelection = async (item) => {
  if (!item || !item.steamurl) {
    console.error('No Steam URL available')
    return
  }
  window.open(item.steamurl, '_blank')
}

const inspectItem = (item) => {
  if (!item || !item.inspectlink) {
    console.error('No inspect link available')
    return
  }
  window.open(item.inspectlink, '_blank')
}

const getWearColor = computed(() => {
  const wearCode = selectedItem.value?.wear?.toLowerCase() || ''
  switch (wearCode) {
    case 'fn':
      return '#4B69FF' // Factory New
    case 'mw':
      return '#02FF3D' // Minimal Wear
    case 'ft':
      return '#7FFF00' // Field-Tested
    case 'ww':
      return '#FFA500' // Well-Worn
    case 'bs':
      return '#FF0000' // Battle-Scarred
    default:
      return '#FFFFFF'
  }
})

const getWearText = computed(() => {
  const wearCode = selectedItem.value?.wear?.toLowerCase() || ''
  switch (wearCode) {
    case 'fn':
      return 'Factory New'
    case 'mw':
      return 'Minimal Wear'
    case 'ft':
      return 'Field-Tested'
    case 'ww':
      return 'Well-Worn'
    case 'bs':
      return 'Battle-Scarred'
    default:
      return ''
  }
})
</script>

<template>
  <div>
    <div class="total-price">Total Inventory Value: ${{ FormatedTotalPrice }}</div>
    <img src="./assets/logo.png" alt="" />
    <button @click="toggleMenu" class="hamburguesa">☰ Filtres</button>
    <div v-if="showMenu" class="menu">
      <p class="menu-title">Filtres</p>
      <button @click="sortByRarity" class="big-button">Trier par Rareté</button>
      <button @click="sortByPrice" class="big-button">Trier par Prix</button>
      <div class="filter-options">
        <label class="filter-option">
          <input type="checkbox" v-model="filterStatTrak" />
          <span>Afficher seulement les armes StatTrak™</span>
        </label>
        <label class="filter-option">
          <input type="checkbox" v-model="filterStarred" />
          <span>Afficher seulement les couteaux et gants ★</span>
        </label>
      </div>
      <label>
        <span class="label-text">Rechercher par nom:</span>
        <input type="text" v-model="searchName" />
      </label>
      <div class="rarity-filters">
        <p>Filter par rareté:</p>
        <div class="rarity-options">
          <label v-for="rarity in weaponrarity" :key="rarity.id" class="rarity-option">
            <input type="checkbox" v-model="selectedRarities" :value="rarity.name" />
            <span :style="`color: #${rarity.color}`">{{ rarity.name }}</span>
          </label>
        </div>
      </div>
    </div>
    <ul v-if="inventoryStore.inventory && !isLoading" id="allcards">
      <div
        v-for="(item, index) in paginatedInventory"
        :key="index"
        class="card"
        @click="handleCardClick(item)"
      >
        <div class="content">
          <div
            class="back"
            :style="`--dynamic-gradient: linear-gradient(90deg, transparent, #${item.color}, #${item.color}, #${item.color}, #${item.color}, transparent);`"
          >
            <div class="back-content">
              <img :src="item.image" alt="" />
              <p style="color: gray" v-html="formatItemName(item.markethashname)"></p>
              <strong style="text-align: left; max-width: 50%">{{ item.buyorderavg }}$</strong>
            </div>
          </div>
        </div>
      </div>
    </ul>
    <div v-if="totalPages > 1" class="pagination">
      <button
        class="pagination-button"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        Previous
      </button>

      <template v-for="page in getPageNumbers" :key="page">
        <button
          v-if="page !== '...'"
          class="pagination-button"
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <span v-else class="pagination-ellipsis"> ••• </span>
      </template>

      <button
        class="pagination-button"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        Next
      </button>
    </div>
    <p v-else-if="isLoading">chargement de l'inventaire...</p>
    <Footer />
  </div>
  <div v-if="selectedItem" class="overlay" @click="handleClickOutside">
    <div class="animated-div">
      <div class="item-details">
        <button class="close-button" @click="closeDiv">✖</button>
        <h3>{{ selectedItem.markethashname }}</h3>
        <img :src="selectedItem.image" alt="" />
        <p class="price-text">Price: {{ selectedItem.buyorderavg }}$</p>
        <div v-if="selectedItem?.wear" class="wear-quality">
          <span>Qualitté de l'item: </span>
          <span :style="{ color: getWearColor }">{{ getWearText }}</span>
        </div>
        <Graph :selectedItem="selectedItem" />
        <div class="chart-container">
          <canvas ref="chartRef"></canvas>
        </div>
        <div class="button-group">
          <button
            class="modern-button"
            @click="SellCurrentSelection(selectedItem)"
            v-if="selectedItem.steamurl"
          >
            Vendre Immédiatement
          </button>
          <button
            class="modern-button"
            @click="inspectItem(selectedItem)"
            v-if="selectedItem.inspectlink"
          >
            Inspecter l'Item
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@400;500;600&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

h3,
.price-text {
  font-family: 'Orbitron', sans-serif;
}

.overlay {
  background-color: rgba(17, 17, 17, 0.95);
}

.animated-div {
  background-color: #1a1a1a;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  border-radius: 0;
  color: white;
  padding: 40px;
  animation: slideIn 0.5s ease-out;
}

.close-button {
  position: absolute;
  top: -20px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close-button:hover {
  opacity: 1;
}

.modern-button {
  background-color: #4b69ff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition:
    transform 0.2s,
    background-color 0.2s;
}

.modern-button:hover {
  background-color: #5d78ff;
  transform: translateY(-2px);
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.chart-container {
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  animation: fadeIn 0.8s ease-out;
}

/* Update menu buttons */
.menu button,
.hamburguesa {
  background-color: #2a2a2a;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  transition: background-color 0.2s;
}

.menu button:hover,
.hamburguesa:hover {
  background-color: #3a3a3a;
}

@keyframes slideIn {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

img {
  max-width: 150px;
  display: block;
  margin: 0 auto;
}

#allcards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 25px;
  padding: 20px;
  margin: 0 auto;
  max-width: 1200px;
}

.card {
  position: relative;
  z-index: 10;
  overflow: visible;
  width: 190px;
  height: 254px;
  margin: 5px;
}

.content {
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 300ms;
  box-shadow: 0px 0px 10px 1px #000000ee;
  border-radius: 5px;
}

.back {
  background-color: #151515;
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 5px;
  overflow: hidden;
  justify-content: center;
  display: flex;
  align-items: center;
}

.back::before {
  position: absolute;
  content: ' ';
  display: block;
  width: 160px;
  height: 160%;
  background: var(
    --dynamic-gradient,
    linear-gradient(90deg, transparent, #ff9966, #ff9966, #ff9966, #ff9966, transparent)
  );
  animation: rotation_481 5000ms infinite linear;
}

.back-content {
  font-size: small;
  text-align: left;
  position: absolute;
  width: 99%;
  height: 99%;
  background-color: #151515;
  border-radius: 5px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
}

@keyframes rotation_481 {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1165456466216;
}

.animated-div {
  overflow-y: hidden;
  background-color: #151515;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.9);
  animation: fadeIn 0.5s;
  z-index: 1000;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  width: 80%;
  height: 80%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.item-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.hamburguesa {
  display: block;
  margin: 1rem auto;
  width: 220px;
  padding: 12px 24px;
  font-size: 1rem;
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: white;
  border-radius: 25px;
  transition: all 0.3s ease;
  position: relative;
}

.hamburguesa:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.menu {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  z-index: 1001;
  width: 250px;
  margin-top: 10px;
}

.menu-title {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
}

.menu button {
  display: block;
  margin-bottom: 15px;
  width: 100%;
}

.menu label {
  display: block;
  margin-bottom: 20px;
  color: white;
}

.label-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 500;
}

.value-text {
  color: white;
  margin-left: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.pagination-button {
  background-color: #2a2a2a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
}

.pagination-button:hover:not(:disabled) {
  background-color: #3a3a3a;
  transform: translateY(-2px);
}

.pagination-button.active {
  background-color: #4b69ff;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-ellipsis {
  color: white;
  opacity: 0.7;
  padding: 8px;
  user-select: none;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
}

.total-price {
  width: 40%;
  max-width: 400px;
  margin: 1rem auto;
  color: white;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.2rem;
  text-align: center;
  padding: 0.5rem;
  background-color: rgba(42, 42, 42, 0.5);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

/* Add responsive styles for mobile */
@media (max-width: 768px) {
  .card {
    width: 145px; /* Smaller width for mobile */
    height: 194px; /* Maintain aspect ratio */
  }

  .back-content {
    gap: 15px; /* Reduce gap between elements */
  }

  .back-content img {
    max-width: 100px; /* Smaller images */
  }

  .back-content p {
    font-size: 0.8rem; /* Smaller text */
    margin: 0;
  }

  .back-content strong {
    font-size: 0.9rem;
  }

  #allcards {
    gap: 15px;
    padding: 15px;
  }

  .menu {
    width: 90%;
    max-width: 250px;
  }
}

/* For very small screens */
@media (max-width: 320px) {
  .card {
    width: 130px;
    height: 174px;
  }

  .back-content img {
    max-width: 80px;
  }

  #allcards {
    gap: 8px;
  }
}

.menu input[type='range'] {
  width: 100%;
  margin: 8px 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
}

.menu input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #4b69ff;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.1s;
}

.menu input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.menu input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #4b69ff;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.1s;
  border: none;
}

.menu input[type='range']::-moz-range-thumb:hover {
  transform: scale(1.1);
}

.menu input[type='text'] {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  margin-top: 8px;
}

.menu input[type='text']:focus {
  outline: none;
  border-color: #4b69ff;
}

.filter-options {
  margin-bottom: 20px;
}

.filter-option {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.filter-option input {
  margin-right: 10px;
}

.stattrak {
  color: #cf6a32;
  font-weight: bold;
}

.wear-quality {
  margin: 10px 0;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  text-align: center;
  color: white;
}

.wear-quality span {
  text-transform: none;
}

.rarity-filters {
  margin: 15px 0;
  padding: 10px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.rarity-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rarity-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.rarity-option input[type='checkbox'] {
  cursor: pointer;
}
</style>
