/**
 * Type declarations for optional @capacitor-community/barcode-scanner module
 * This allows the code to compile even if the module is not installed
 */
declare module "@capacitor-community/barcode-scanner" {
  export interface BarcodeScannerPermissionStatus {
    hasPermission: boolean;
  }

  export interface BarcodeScannerPermissionResult {
    granted: boolean;
  }

  export interface BarcodeScannerScanResult {
    hasContent: boolean;
    content?: string;
  }

  export interface BarcodeScanner {
    hasPermission(): Promise<BarcodeScannerPermissionStatus>;
    checkPermission(options: { force?: boolean }): Promise<BarcodeScannerPermissionResult>;
    startScan(): Promise<BarcodeScannerScanResult>;
    stopScan(): Promise<void>;
  }

  export const BarcodeScanner: BarcodeScanner;
}

