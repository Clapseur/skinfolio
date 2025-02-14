<template>
  <LineChart id="prix" :options="chartOptions" :data="chartData" />
</template>

<script>
import { useInventoryStore } from '@/stores/inventaire'
import { Line as LineChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

export default {
  name: 'PrixDeVente',
  components: { LineChart },
  props: {
    selectedItem: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      store: useInventoryStore(),
      chartData: {
        pointStyle: 'cross',
        labels: [
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString(), // permet le calcule des dates disponible par la api
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(),
          `Aujourd'hui`,
        ],
        datasets: [
          {
            label: 'Prix de vente récent',
            data: [
              this.selectedItem?.priceavg90d || 0,
              this.selectedItem?.priceavg30d || 0,
              this.selectedItem?.priceavg7d || 0,
              this.selectedItem?.priceavg24h || 0,
              this.selectedItem?.buyorderavg || 0,
            ],
            borderColor: '#4b69ff',
            tension: 0.3,
            showLine: true,
            pointHitRadius: 15, // relire la doc pour bien maitriser les propriétés du chart
            pointHoverRadius: 15,
            pointHoverBorderWidth: 2,
            pointHoverBorderColor: '#4b69ff',
            pointHoverBackgroundColor: '#4b69ff',
          },
        ],
      },
      chartOptions: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              color: '#666',
              font: {
                size: 12,
                family: 'Arial',
              },
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}€`
              },
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: function (value) {
                return value.toLocaleString() + '$'
              },
            },
          },
        },
      },
    }
  },
  mounted() {
    console.log(this.selectedItem)
  },
}
</script>
