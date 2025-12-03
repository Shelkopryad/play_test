# Electron Playwright Recorder

A lightweight desktop application designed to assist QA engineers in recording and reproducing bugs. It leverages **Electron** for the UI and **Playwright** for browser automation and video recording.

## Features

-   **Browser Control**: Launches a Chromium browser instance directly from the app.
-   **Video Recording**: Automatically records the entire browser session.
-   **Event Logging**: Captures user interactions (clicks, text changes) and saves them as a structured `scenario.json` file.
-   **Evidence Management**:
    -   **Pass**: Automatically cleans up the recorded video to save space.
    -   **Fail**: Saves the video and scenario log to a timestamped folder (e.g., `videos/failed/YYYY-MM-DD_HH-MM-SS`).
-   **Quick Access**: Provides a direct link to open the folder containing the failed test evidence.
-   **Modern UI**: Features a clean, dark-themed Material Design interface.

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    ./setup.sh
    ```

## Usage

1.  Start the application:
    ```bash
    npm start
    ```
2.  Click **Start Test** to launch the browser.
3.  Perform your test steps in the opened Chromium window.
4.  **If the test passes**: Click **Passed**. The video will be deleted.
5.  **If the test fails**: Click **Fail**. The video and action log will be saved, and a link to the folder will appear in the app.

## Technologies

-   Electron
-   Playwright
-   Node.js
-   Vanilla CSS (Material Design)
