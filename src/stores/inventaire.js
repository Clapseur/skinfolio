import { defineStore } from 'pinia'
import axios from 'axios'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    inventory: null,
    steamId: localStorage.getItem('steamId') || null,
  }),
  actions: {
    setSteamId(id) {
      this.steamId = id
      localStorage.setItem('steamId', id)
    },

    async fetchInventory() {
      if (!this.steamId) return

      try {
        const response = await axios.get('https://www.steamwebapi.com/steam/api/inventory', {
          params: {
            key: 'QC6G505W6UO6L18T',
            steam_id: this.steamId,
          },
        })

        this.inventory = response.data
        localStorage.setItem('inventoryData', JSON.stringify(response.data))
        localStorage.setItem('inventoryExpiry', (Date.now() + 60 * 60 * 24 * 1000).toString())
      } catch (error) {
        console.error("Erreur lors de la recuperation de l'inventaire", error)
        throw error
      }
    },
  },
})
