import './style.css'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'

// State
let inventory = []

// DOM Elements
const countElement = document.getElementById('count')
const inventoryList = document.getElementById('inventory-list')
const clearBtn = document.getElementById('clear-btn')
const errorMessage = document.getElementById('error-message')

function initializeScanner() {
  try {
    // Configure formats - focusing on common ones for inventory
    const formatsToSupport = [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.QR_CODE
    ]

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      formatsToSupport: formatsToSupport,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      }
    }

    // Initialize scanner
    // 'data-capture-view' is the ID of the container element
    const scanner = new Html5QrcodeScanner(
      "data-capture-view",
      config,
      /* verbose= */ false
    )

    scanner.render(onScanSuccess, onScanFailure)

    console.log('✅ html5-qrcode scanner initialized')

  } catch (error) {
    console.error('Error initializing scanner:', error)
    showError('Failed to initialize scanner: ' + error.message)
  }
}

function onScanSuccess(decodedText, decodedResult) {
  // Handle the scanned code
  console.log(`Code matched = ${decodedText}`, decodedResult)

  // Add to inventory
  addToInventory(decodedText, decodedResult.result.format?.formatName || 'UNKNOWN')

  // Optional: Add haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(100)
  }
}

function onScanFailure(error) {
  // handle scan failure, usually better to ignore and keep scanning.
  // for example:
  // console.warn(`Code scan error = ${error}`);
}

// Add scanned item to inventory
function addToInventory(barcodeData, symbology) {
  const now = new Date()
  const timeString = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  // Check for duplicates if needed, or just add
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

// Event listeners
clearBtn.addEventListener('click', clearInventory)

// Initialize on page load
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  initializeScanner()
})
