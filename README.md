# BLE Connect

BLE Connect is a React Native application designed to interact with ESP32 devices via Bluetooth Low Energy (BLE). This app facilitates communication and control of ESP32-based IoT projects, providing a user-friendly interface for BLE-enabled projects.

## Installation

You can download the latest APK from the [Releases](https://github.com/tomasjakl/ble-connect-app/releases) page and install it on your Android device:

1. Visit the [Releases](https://github.com/tomasjakl/ble-connect-app/releases) page.
2. Download the latest APK file.
3. Enable "Install from unknown sources" in your device settings if not already done.
4. Install the APK and launch the app.

## Development

### Requirements

- Node.js >= 18
- Android development tools (e.g., Android SDK and platform tools)
- A physical Android device

### Clone the repository

   ```bash
   git clone https://github.com/tomasjakl/ble-connect-app
   cd ble-connect
   ```

### Install dependencies

   ```bash
   npm install
   ```

### Run the App

#### Start the development server

  ```bash
  npm start
  ```

#### Run on Android

  ```bash
  npm run android
  ```

#### Run on iOS (development only)

  ```bash
  npm run ios
  ```

#### Note

The app has not been tested on iOS devices, and full functionality is not guaranteed.
