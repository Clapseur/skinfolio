<template>
  <div class="landing-container">
    <PageHeader />
    <div class="hero-section">
      <h1>Bienvenue sur SkinFolio</h1>
      <p class="hero-text">
        La première plateforme qui transforme votre inventaire CS2 en un portfolio professionnel,
        parce que vos skin représente tellement plus que de simple pixels
      </p>
    </div>

    <div class="features-layout">
      <div class="feature-container">
        <div class="divStylé">
          <h3>Visualisation Professionnelle</h3>
          <p>
            Affichez vos skins comme jamais auparavant avec des graphiques détaillés et des
            statistiques historiques et en temps réel
          </p>
        </div>
      </div>

      <div class="feature-container">
        <div class="divStylé mockup-container">
          <h3>Suivi des Prix</h3>
          <p>Surveillez l'évolution des prix de vos skins sur différentes périodes</p>
          <img class="mockup-image" src="../assets/mockup.png" alt="Mockup" />
        </div>
      </div>

      <div class="feature-container">
        <div class="divStylé">
          <h3>Interface Intuitive</h3>
          <p>Une expérience utilisateur fluide et moderne pour gérer votre collection</p>
        </div>
      </div>
    </div>

    <div id="login-section" class="login-section" v-if="!isLoading">
      <h2>Commencer</h2>
      <p>Entrez votre lien de profil Steam pour accéder à votre portfolio</p>
      <div class="login-form">
        <input
          type="text"
          v-model="steamUrl"
          placeholder="https://steamcommunity.com/id/votre-profil"
          :class="{ error: error }"
        />
        <button @click="handleLogin" :disabled="isLoading">
          {{ isLoading ? 'Chargement...' : 'Voir mon Portfolio' }}
        </button>
      </div>
      <p class="error-message" v-if="error">{{ error }}</p>
      <p class="help-text">
        Vous ne trouvez pas votre profile ?
        <a href="https://steamcommunity.com/my" target="_blank"> Le voici ! </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventaire'
import axios from 'axios'
import PageHeader from '@/components/Header.vue'

const router = useRouter()
const store = useInventoryStore()
const steamUrl = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  error.value = ''
  if (!steamUrl.value) {
    error.value = 'Veuillez entrer un lien Steam valide'
    return
  }

  isLoading.value = true
  try {
    const steamId = await convertToSteamId3(steamUrl.value)
    store.setSteamId(steamId)
    await store.fetchInventory()
    router.push('/inventory')
  } catch (err) {
    error.value = 'Lien Steam invalide. Veuillez vérifier et réessayer.'
  }
  isLoading.value = false
}

const convertToSteamId3 = async (url) => {
  try {
    const urlPattern = /steamcommunity\.com\/(id|profiles)\/([^/\s]+)/
    const match = url.match(urlPattern)

    if (!match) {
      throw new Error(
        'Format URL Steam invalide. Exemple: https://steamcommunity.com/id/votre-profil',
      )
    }

    const [, type, identifier] = match

    if (type === 'profiles') {
      return identifier
    } else {
      const response = await axios.get('/steamapi/ISteamUser/ResolveVanityURL/v1/', {
        params: {
          key: '74D34665E9EB2F20DB4219D8604FBEBE',
          vanityurl: identifier
        }
      })

      if (response.data.response.success === 1) {
        return response.data.response.steamid
      } else {
        throw new Error('Profil Steam introuvable')
      }
    }
  } catch (error) {
    console.error('Erreur de conversion:', error)
    throw error
  }
}
</script>

<style scoped>
.landing-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: white;
  padding-top: 80px;
}

.hero-section {
  text-align: center;
  padding: 4rem 0;
}

.hero-text {
  font-size: 1.5rem;
  color: #999;
  max-width: 800px;
  margin: 1rem auto;
}

.features-layout {
  padding: 4rem 0;
}

.feature-container {
  margin-bottom: 2rem;
}

.divStylé {
  position: relative;
  overflow: visible;
  left: 50px;
  background: rgba(75, 105, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid rgba(75, 105, 255, 0.2);
}

.login-section {
  text-align: center;
  padding: 4rem 0;
  scroll-margin-top: 80px;
}

.login-form {
  max-width: 500px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-form input,
.login-form button {
  width: 100%;
  max-width: 400px;
}

input {
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: white;
}

input.error {
  border-color: #ff4b4b;
}

button {
  width: 100%;
  padding: 1rem;
  background: #4b69ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.2s;
}

button:hover {
  background: #5d78ff;
}

button:disabled {
  background: #666;
  cursor: not-allowed;
}

.error-message {
  color: #ff4b4b;
  margin-top: 1rem;
}

.help-text {
  color: #999;
  margin-top: 2rem;
}

.help-text a {
  color: #4b69ff;
  text-decoration: none;
}

.mockup-container {
  position: relative;
  overflow: visible;
  padding-bottom: 6rem;
  left: -50px;
}

.mockup-image {
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 300px;
  height: auto;
  z-index: -1;
}

@media (max-width: 768px) {
  .hero-text {
    font-size: 1.2rem;
  }

  .mockup-image {
    width: 300px;
    bottom: 0px;
    right: 0px;
  }
}
</style>
