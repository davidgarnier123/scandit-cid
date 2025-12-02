import './style.css'
import { DataCaptureContext } from '@scandit/web-datacapture-core'
import {
  barcodeCaptureLoader,
  SparkScanSettings,
  SparkScan,
  SparkScanViewSettings,
  SparkScanView,
  Symbology
} from '@scandit/web-datacapture-barcode'

// State
let context = null
let sparkScan = null
let sparkScanView = null
let inventory = []

// DOM Elements
const countElement = document.getElementById('count')
const inventoryList = document.getElementById('inventory-list')
const clearBtn = document.getElementById('clear-btn')
const errorMessage = document.getElementById('error-message')

async function initializeScanner() {
  try {
    const licenseKey = import.meta.env.VITE_SCANDIT_LICENSE_KEY

    if (!licenseKey || licenseKey === 'votre_cle_scandit_ici') {
      throw new Error(
        'Clé Scandit non configurée. Créez un fichier .env avec VITE_SCANDIT_LICENSE_KEY=votre_cle'
      )
    }

    // 1. Create a new DataCaptureContext instance
    await DataCaptureContext.forLicenseKey(licenseKey, {
      libraryLocation: 'sdc-lib/',
      moduleLoaders: [barcodeCaptureLoader()]
    })

    context = await DataCaptureContext.create()

    // 2. Configure the Spark Scan Mode
    const sparkScanSettings = new SparkScanSettings()
    // Enable EAN13 and Code 128 as examples, adjust as needed
    sparkScanSettings.enableSymbologies([Symbology.EAN13UPCA, Symbology.Code128])

    sparkScan = SparkScan.forSettings(sparkScanSettings)

    // 3. Setup the Spark Scan View
    const sparkScanViewSettings = new SparkScanViewSettings()
    // You can customize appearance here if needed

    // Add SparkScanView to the DOM
    // We attach it to document.body as it's a floating UI usually, 
    // or a specific container if you prefer. The guide suggests document.body or a parent.
    // Given the previous code used 'data-capture-view', we might want to check if that's still appropriate,
    // but SparkScanView is often full screen or floating. Let's use document.body for now as per guide example
    // or we can try to attach it to a specific container if the UI requires it.
    // The guide says: "Add a SparkScanView to your view hierarchy."
    sparkScanView = SparkScanView.forElement(
      document.body,
      context,
      sparkScan,
      sparkScanViewSettings
    )

    await sparkScanView.prepareScanning()

    // 4. Register the Listener
    const listener = {
      didScan: (sparkScan, session, frameData) => {
        const barcode = session.newlyRecognizedBarcode
        if (barcode != null) {
          addToInventory(barcode.data, barcode.symbology)

          // Feedback is handled by SparkScan usually, but we can add custom if needed
        }
      }
    }

    sparkScan.addListener(listener)

    console.log('✅ SparkScan initialisé avec succès')

  } catch (error) {
    console.error('Erreur lors de l\'initialisation de SparkScan:', error)
    showError(error.message || 'Erreur d\'initialisation du scanner')
  }
}

// Add scanned item to inventory
function addToInventory(barcodeData, symbology) {
  const now = new Date()
  const timeString = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const item = {
    id: now.getTime(),
    barcode: barcodeData,
    symbology: symbology,
    timestamp: timeString
  }

  inventory.unshift(item)
  updateInventoryDisplay()
  updateCounter()
}

// Update inventory list UI
function updateInventoryDisplay() {
  if (inventory.length === 0) {
    inventoryList.innerHTML = `
      <div class="empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>Aucun code scanné</p>
      </div>
    `
    return
  }

  inventoryList.innerHTML = inventory
    .map((item, index) => `
      <div class="inventory-item">
        <div class="item-number">${inventory.length - index}</div>
        <div class="item-content">
          <div class="item-barcode">${item.barcode}</div>
          <div class="item-time">⏰ ${item.timestamp}</div>
        </div>
      </div>
    `).join('')
}

// Update counter
function updateCounter() {
  countElement.textContent = inventory.length
}

// Clear inventory
function clearInventory() {
  if (inventory.length === 0) return

  if (confirm(`Effacer tous les ${inventory.length} codes scannés ?`)) {
    inventory = []
    updateInventoryDisplay()
    updateCounter()
  }
}

// Show error message
function showError(message) {
  errorMessage.textContent = `❌ ${message}`
  errorMessage.classList.remove('hidden')

  setTimeout(() => {
    errorMessage.classList.add('hidden')
  }, 5000)
}

// Handle app state changes
async function handleAppStateChange() {
  if (document.hidden) {
    if (sparkScanView) sparkScanView.stopScanning()
  } else {
    if (sparkScanView) sparkScanView.prepareScanning()
  }
}

// Event listeners
clearBtn.addEventListener('click', clearInventory)
document.addEventListener('visibilitychange', handleAppStateChange)

// Initialize
initializeScanner()

// Cleanup
window.addEventListener('beforeunload', () => {
  if (sparkScanView) {
    sparkScanView.stopScanning()
  }
  if (context) {
    context.dispose()
  }
})
