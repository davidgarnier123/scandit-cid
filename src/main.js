import './style.css'
import * as SDCCore from '@scandit/web-datacapture-core'
import * as SDCBarcode from '@scandit/web-datacapture-barcode'

// State
let inventory = []
let context = null
let camera = null
let barcodeCapture = null
let view = null

// DOM Elements
const countElement = document.getElementById('count')
const inventoryList = document.getElementById('inventory-list')
const clearBtn = document.getElementById('clear-btn')
const errorMessage = document.getElementById('error-message')

// Initialize Scandit
async function initializeScanner() {
  try {
    const licenseKey = import.meta.env.VITE_SCANDIT_LICENSE_KEY

    if (!licenseKey || licenseKey === 'votre_cle_scandit_ici') {
      throw new Error(
        'Clé Scandit non configurée. Créez un fichier .env avec VITE_SCANDIT_LICENSE_KEY=votre_cle'
      )
    }

    // Create DataCaptureContext with license key and local library location
    // The libraryLocation must point to the folder containing the WASM files (copied to public/sdc-lib)
    context = await SDCCore.DataCaptureContext.forLicenseKey(licenseKey, {
      libraryLocation: 'sdc-lib/',
      moduleLoaders: [
        { moduleName: 'core' },
        { moduleName: 'barcode' },
        { moduleName: 'barcodecapture' }
      ]
    })

    // Setup camera as frame source
    const cameraSettings = SDCBarcode.BarcodeCapture.recommendedCameraSettings
    camera = SDCCore.Camera.default
    if (camera) {
      await camera.applySettings(cameraSettings)
      await context.setFrameSource(camera)
    }

    // Configure barcode capture settings for Code 128
    const settings = new SDCBarcode.BarcodeCaptureSettings()

    // Enable only Code 128 symbology for better performance
    settings.enableSymbologies([SDCBarcode.Symbology.Code128])

    // Enable continuous scanning by setting codeDuplicateFilter to 0
    settings.codeDuplicateFilter = 0

    // Create BarcodeCapture mode
    barcodeCapture = await SDCBarcode.BarcodeCapture.forContext(context, settings)

    // Add listener for barcode scans
    const listener = {
      didScan: (barcodeCapture, session) => {
        const recognizedBarcodes = session.newlyRecognizedBarcodes

        if (recognizedBarcodes.length > 0) {
          const barcode = recognizedBarcodes[0]
          addToInventory(barcode.data, barcode.symbology)

          // Optional: Add haptic feedback on mobile
          if (navigator.vibrate) {
            navigator.vibrate(100)
          }
        }
      }
    }

    barcodeCapture.addListener(listener)

    // Create DataCaptureView and attach to DOM
    view = await SDCCore.DataCaptureView.forContext(context)
    view.connectToElement(document.getElementById('data-capture-view'))

    // Add camera switch control
    view.addControl(new SDCCore.CameraSwitchControl())

    // Add overlay for visual feedback
    await SDCBarcode.BarcodeCaptureOverlay.withBarcodeCaptureForView(
      barcodeCapture,
      view
    )

    // Start camera
    if (camera) {
      await camera.switchToDesiredState(SDCCore.FrameSourceState.On)
    }

    console.log('✅ Scanner Scandit initialisé avec succès')

  } catch (error) {
    console.error('Erreur lors de l\'initialisation du scanner:', error)
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

  inventory.unshift(item) // Add to beginning
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

// Event listeners
clearBtn.addEventListener('click', clearInventory)

// Initialize on page load
initializeScanner()

// Cleanup on page unload
window.addEventListener('beforeunload', async () => {
  if (camera) {
    await camera.switchToDesiredState(SDCCore.FrameSourceState.Off)
  }
  if (context) {
    await context.dispose()
  }
})
