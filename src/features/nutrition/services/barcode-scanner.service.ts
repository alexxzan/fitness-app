import { Capacitor } from "@capacitor/core";

/**
 * Service for barcode scanning
 * Supports both native (Capacitor) and web (camera API) platforms
 */

// Module name as variable to prevent Vite from analyzing at build time
const BARCODE_SCANNER_MODULE = "@capacitor-community/barcode-scanner";

export class BarcodeScannerService {
  /**
   * Check if barcode scanning is available
   */
  static async isAvailable(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      // Check if barcode scanner plugin is available
      try {
        // Use dynamic import with error handling
        let barcodeScannerModule;
        try {
          barcodeScannerModule = await import(
            /* @vite-ignore */ BARCODE_SCANNER_MODULE
          );
        } catch (importError) {
          // Module not installed - this is expected in development
          return false;
        }
        if (!barcodeScannerModule || !barcodeScannerModule.BarcodeScanner) {
          return false;
        }
        const { BarcodeScanner } = barcodeScannerModule;
        const result = await BarcodeScanner.hasPermission();
        return result.hasPermission;
      } catch {
        // Plugin not installed or not available
        return false;
      }
    } else {
      // Web: Check if camera API is available
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
  }

  /**
   * Request camera permissions
   */
  static async requestPermission(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        let barcodeScannerModule;
        try {
          barcodeScannerModule = await import(
            /* @vite-ignore */ BARCODE_SCANNER_MODULE
          );
        } catch {
          return false;
        }
        if (!barcodeScannerModule || !barcodeScannerModule.BarcodeScanner) {
          return false;
        }
        const { BarcodeScanner } = barcodeScannerModule;
        const result = await BarcodeScanner.checkPermission({ force: true });
        return result.granted;
      } catch {
        return false;
      }
    } else {
      // Web: Request camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Start barcode scanning
   */
  static async startScan(): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      return await this.scanNative();
    } else {
      return await this.scanWeb();
    }
  }

  /**
   * Stop barcode scanning
   */
  static async stopScan(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        let barcodeScannerModule;
        try {
          barcodeScannerModule = await import(
            /* @vite-ignore */ BARCODE_SCANNER_MODULE
          );
        } catch {
          return; // Module not available, nothing to stop
        }
        if (!barcodeScannerModule || !barcodeScannerModule.BarcodeScanner) {
          return;
        }
        const { BarcodeScanner } = barcodeScannerModule;
        await BarcodeScanner.stopScan();
      } catch (error) {
        console.error("Failed to stop native scanner:", error);
      }
    } else {
      // Web: Stop camera stream
      if (this.webStream) {
        this.webStream.getTracks().forEach((track) => track.stop());
        this.webStream = null;
      }
      if (this.webVideoElement) {
        this.webVideoElement.srcObject = null;
        this.webVideoElement = null;
      }
    }
  }

  private static webStream: MediaStream | null = null;
  private static webVideoElement: HTMLVideoElement | null = null;

  /**
   * Native barcode scanning using Capacitor plugin
   */
  private static async scanNative(): Promise<string | null> {
    try {
      let barcodeScannerModule;
      try {
        barcodeScannerModule = await import(
          /* @vite-ignore */ BARCODE_SCANNER_MODULE
        );
      } catch {
        throw new Error("Barcode scanner plugin not available");
      }
      if (!barcodeScannerModule || !barcodeScannerModule.BarcodeScanner) {
        throw new Error("Barcode scanner plugin not available");
      }
      const { BarcodeScanner } = barcodeScannerModule;

      // Check and request permission
      const hasPermission = await BarcodeScanner.hasPermission();
      if (!hasPermission.hasPermission) {
        const granted = await this.requestPermission();
        if (!granted) {
          throw new Error("Camera permission denied");
        }
      }

      // Start scanning
      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        await BarcodeScanner.stopScan();
        return result.content || null;
      }

      return null;
    } catch (error) {
      console.error("Native barcode scan failed:", error);
      throw error;
    }
  }

  /**
   * Web barcode scanning using camera API and barcode detection
   * Note: This is a simplified implementation. For production, consider using
   * a library like @zxing/library or html5-qrcode for better barcode detection
   */
  private static async scanWeb(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      // For web, we'll use a simplified approach with manual entry fallback
      // Full barcode detection would require additional libraries
      // This implementation provides the structure for future enhancement
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          this.webStream = stream;
          // In a full implementation, you would:
          // 1. Create a video element
          // 2. Use a barcode detection library (e.g., @zxing/library)
          // 3. Continuously scan frames for barcodes
          // 4. Return the detected barcode

          // For now, we'll return null and rely on manual entry
          // The UI will show manual entry option
          resolve(null);
        })
        .catch((error) => {
          console.error("Web camera access failed:", error);
          reject(error);
        });
    });
  }
}
