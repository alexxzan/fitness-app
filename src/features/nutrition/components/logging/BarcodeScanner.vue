<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>Scan Barcode</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleClose">
            <ion-icon :icon="close" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="barcode-scanner">
        <div v-if="scanning" class="scanner-active">
          <div class="scanner-viewfinder">
            <div class="viewfinder-frame"></div>
            <p class="scanning-hint">Position barcode within the frame</p>
          </div>
          <ion-button expand="block" color="danger" @click="stopScan">
            Stop Scanning
          </ion-button>
        </div>
        <div v-else class="scanner-placeholder">
          <ion-icon :icon="barcode" class="scanner-icon" />
          <p>Barcode Scanner</p>
          <p class="hint">{{ scannerAvailable ? 'Tap to start scanning' : 'Camera access required' }}</p>
          <ion-button expand="block" @click="startScan" :disabled="!scannerAvailable && !permissionGranted">
            <ion-icon :icon="camera" slot="start" />
            Start Scanning
          </ion-button>
          <ion-button expand="block" fill="outline" @click="handleManualEntry">
            Enter Barcode Manually
          </ion-button>
        </div>

        <!-- Manual Entry Modal -->
        <ion-modal :is-open="showManualEntry" @didDismiss="showManualEntry = false">
          <ion-header>
            <ion-toolbar>
              <ion-title>Enter Barcode</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="showManualEntry = false">
                  <ion-icon :icon="close" slot="icon-only" />
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <div class="manual-entry">
              <ion-item>
                <ion-label position="stacked">Barcode Number</ion-label>
                <ion-input
                  v-model="manualBarcode"
                  type="text"
                  placeholder="Enter barcode"
                  @keyup.enter="submitManualBarcode"
                />
              </ion-item>
              <ion-button expand="block" @click="submitManualBarcode" :disabled="!manualBarcode">
                Search
              </ion-button>
            </div>
          </ion-content>
        </ion-modal>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  toastController,
} from "@ionic/vue";
import { close, barcode, camera } from "ionicons/icons";
import { BarcodeScannerService } from "@/features/nutrition/services/barcode-scanner.service";

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  barcodeScanned: [barcode: string];
}>();

const showManualEntry = ref(false);
const manualBarcode = ref("");
const scanning = ref(false);
const scannerAvailable = ref(false);
const permissionGranted = ref(false);

onMounted(async () => {
  scannerAvailable.value = await BarcodeScannerService.isAvailable();
});

watch(() => props.isOpen, async (newVal) => {
  if (!newVal) {
    await stopScan();
    showManualEntry.value = false;
    manualBarcode.value = "";
  } else {
    // Check permission when modal opens
    permissionGranted.value = await BarcodeScannerService.requestPermission();
  }
});

async function startScan() {
  if (!scannerAvailable.value && !permissionGranted.value) {
    const granted = await BarcodeScannerService.requestPermission();
    if (!granted) {
      const toast = await toastController.create({
        message: "Camera permission is required for barcode scanning",
        duration: 3000,
        color: "warning",
      });
      await toast.present();
      return;
    }
    permissionGranted.value = true;
  }

  scanning.value = true;
  try {
    const barcode = await BarcodeScannerService.startScan();
    if (barcode) {
      emit("barcodeScanned", barcode);
      await stopScan();
      emit("close");
    } else {
      // If no barcode detected, show manual entry option
      await stopScan();
      const toast = await toastController.create({
        message: "No barcode detected. Try manual entry.",
        duration: 2000,
      });
      await toast.present();
    }
  } catch (error) {
    console.error("Barcode scan error:", error);
    await stopScan();
    const toast = await toastController.create({
      message: "Failed to scan barcode. Try manual entry.",
      duration: 3000,
      color: "warning",
    });
    await toast.present();
  }
}

async function stopScan() {
  scanning.value = false;
  await BarcodeScannerService.stopScan();
}

function handleClose() {
  stopScan();
  emit("close");
}

function handleManualEntry() {
  showManualEntry.value = true;
}

function submitManualBarcode() {
  if (manualBarcode.value.trim()) {
    emit("barcodeScanned", manualBarcode.value.trim());
    showManualEntry.value = false;
    manualBarcode.value = "";
    emit("close");
  }
}
</script>

<style scoped>
.barcode-scanner {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.scanner-placeholder {
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}

.scanner-icon {
  font-size: 80px;
  color: var(--color-text-tertiary);
  opacity: 0.5;
  margin-bottom: var(--spacing-lg);
}

.scanner-placeholder p {
  color: var(--color-text-secondary);
  margin: var(--spacing-sm) 0;
}

.hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-base);
}

.scanner-active {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.scanner-viewfinder {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: rgba(0, 0, 0, 0.7);
  border-radius: var(--radius-card);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.viewfinder-frame {
  width: 80%;
  height: 80%;
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-base);
  position: relative;
}

.viewfinder-frame::before,
.viewfinder-frame::after {
  content: "";
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid var(--color-primary);
}

.viewfinder-frame::before {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
}

.viewfinder-frame::after {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
}

.scanning-hint {
  position: absolute;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: var(--font-size-sm);
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  padding: var(--spacing-sm) var(--spacing-base);
  border-radius: var(--radius-base);
}

.manual-entry {
  padding: var(--spacing-xl);
}

.manual-entry ion-item {
  margin-bottom: var(--spacing-lg);
}
</style>

