#!/bin/bash

set -e

# Kill any process using port 5173 (e.g., previous Vite dev server)
if lsof -ti:5173 > /dev/null 2>&1; then
  echo "Killing process on port 5173..."
  kill -9 $(lsof -ti:5173)
  sleep 1
fi

# Wait for Vite dev server to be ready
npx wait-on http://localhost:5173

# Get Mac's local IP address for the simulator to connect to
# This finds the active network interface's IP (typically en0 or en1)
MAC_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")

if [ -z "$MAC_IP" ]; then
  echo "Warning: Could not detect Mac's IP address."
  echo "Trying to find alternative network interface..."
  # Try other common interfaces
  MAC_IP=$(ipconfig getifaddr bridge100 2>/dev/null || ipconfig getifaddr utun0 2>/dev/null || echo "localhost")
fi

if [ "$MAC_IP" = "localhost" ] || [ -z "$MAC_IP" ]; then
  echo "Error: Could not detect Mac's IP address."
  echo "Please check your network connection and try again."
  exit 1
fi

echo "Detected Mac IP: $MAC_IP"

# Use Node.js to properly update the TypeScript config file
# Pass MAC_IP as an argument to avoid heredoc variable expansion issues
node -e "
const fs = require('fs');
const path = require('path');

const macIp = '$MAC_IP';
const configPath = path.join(process.cwd(), 'capacitor.config.ts');
let configContent = fs.readFileSync(configPath, 'utf8');
const targetUrl = 'http://' + macIp + ':5173';

// Check if server config already exists with correct URL and port
if (configContent.includes(\"url: '\" + targetUrl + \"'\") || configContent.includes('url: \"' + targetUrl + '\"')) {
  console.log('Config already has correct server URL:', targetUrl);
} else {
  // Remove any existing server config block (handle various formats)
  configContent = configContent.replace(/,\s*server:\s*\{[\s\S]*?url:\s*['\"][^'\"]+['\"][\s\S]*?\}/g, '');
  configContent = configContent.replace(/server:\s*\{[\s\S]*?url:\s*['\"][^'\"]+['\"][\s\S]*?\},?\s*/g, '');
  
  // Remove trailing comma if it exists after webDir
  configContent = configContent.replace(/(webDir: 'dist',)\s*\/\/[^\n]*/g, '\$1');
  
  // Add server config after webDir
  const serverConfig = '  server: {\\n    url: \\'' + targetUrl + '\\',\\n    cleartext: true\\n  }';
  
  // Insert server config after webDir line (keeping any comments)
  configContent = configContent.replace(
    /(webDir: 'dist',)(\s*\/\/[^\n]*)?/,
    '\$1\\n' + serverConfig + ',\$2'
  );
  
  fs.writeFileSync(configPath, configContent, 'utf8');
  console.log('Updated capacitor.config.ts with server URL:', targetUrl);
}
"

# Copy Capacitor config (using copy instead of sync for live reload per Capacitor docs)
# See: https://capacitorjs.com/docs/guides/live-reload
echo "Copying Capacitor config..."
npx cap copy ios || {
  echo "Warning: npx cap copy ios failed, trying npx cap sync ios instead..."
  npx cap sync ios
}

# Find iPhone 16 simulator (prefer booted one, then any iPhone 16 variant)
# This will match iPhone 16, iPhone 16 Pro, iPhone 16 Plus, etc.
DEVICE_ID=$(xcrun simctl list devices available 2>/dev/null | grep -E 'iPhone 16[^0-9]' | grep 'Booted' | head -1 | grep -oE '([A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12})' || true)

# If no booted iPhone 16, get any available iPhone 16 variant
if [ -z "$DEVICE_ID" ]; then
  DEVICE_ID=$(xcrun simctl list devices available 2>/dev/null | grep -E 'iPhone 16[^0-9]' | head -1 | grep -oE '([A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12})' || true)
fi

if [ -z "$DEVICE_ID" ]; then
  echo "Error: Could not find iPhone 16 simulator"
  echo "Available devices:"
  xcrun simctl list devices available | grep -i "iPhone 16"
  exit 1
fi

echo "Using iPhone 16 simulator: $DEVICE_ID"

# Boot the simulator (ignore errors if already booted)
xcrun simctl boot "$DEVICE_ID" 2>/dev/null || true

# Wait a moment for simulator to fully boot
sleep 2

# Run Capacitor with the specific device target
# The explicit server config in capacitor.config.ts provides live reload functionality
# See: https://capacitorjs.com/docs/guides/live-reload
npx cap run ios --target="$DEVICE_ID"