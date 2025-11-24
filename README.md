# **AdXGuard – Ad Blocker Extension**
<img width="1364" height="695" alt="image" src="https://github.com/user-attachments/assets/73f60f9d-783c-445f-bd14-81710d71ec71" />

A lightweight, fast, and privacy-friendly browser extension that blocks ads, trackers, popups, and unwanted scripts to provide a clean and smooth browsing experience.

🚀 Features

Blocks banner ads, video ads, popups, and overlays

Prevents tracking scripts and malicious domains
<img width="377" height="599" alt="image" src="https://github.com/user-attachments/assets/6203f03b-874b-4050-a36f-5fe146a11484" />

Lightweight and fast — minimal resource usage

Simple UI for enabling/disabling ad blocking

Uses declarativeNetRequest rules for better performance
<img width="375" height="605" alt="image" src="https://github.com/user-attachments/assets/16033944-b1cc-4d59-9818-c21a99c1b106" />

Works on Chromium-based browsers (Chrome, Edge, Brave, Opera)

📁 Project Structure

background.js — background service worker

content.js — content scripts that interact with web pages

rules.json — declarativeNetRequest rules for ad blocking

manifest.json — extension configuration

icons/ — extension icons

🛠️ Technologies Used

JavaScript

Chrome Extensions API (Manifest V3)

Declarative Net Request API

📦 Installation (Developer Mode)

Download or clone the repository:

git clone https://github.com/IT21166006/AdXGuard-Ad-blocker


Open Chrome → Extensions

Enable Developer Mode

Click Load Unpacked

Select the project folder

Extension will appear in your browser toolbar

🧪 Testing

Visit any website with ads (e.g., news sites) to test the blocking.
You should see cleaner pages with reduced clutter.

🔒 Privacy

AdXGuard does not collect or send any personal data.
All blocking is done locally inside your browser.

🤝 Contributing

Feel free to open Issues or Pull Requests to improve the extension.

📄 License

This project is released under the MIT License.
