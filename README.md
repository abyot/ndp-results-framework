# NDP Results Framework 📊  
_A pluggable DHIS2 app for tracking and visualizing National Development Plan results_

---

## 🌍 Overview

The **NDP Results Framework** is a standalone web application originally built as part of the DHIS2 core (AngularJS).  
It has now been decoupled into its own **independent, pluggable app**, allowing for separate development and deployment.  
Once built, it can be uploaded into any DHIS2 instance through the **App Management** module. 🚀

---

## 🧱 Tech Stack

- ⚙️ **AngularJS** (legacy DHIS2 app architecture)  
- 🧩 **Webpack** for bundling and build automation  
- 🗂️ **DHIS2 API** integration via configurable base URLs  
- 💅 **CSS / HTML templates** for modular UI components

---

## 🛠️ Project Setup

### 1️⃣ Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v14+ recommended)
- [Yarn](https://yarnpkg.com/) (v1 or v3+)
- A running [DHIS2](https://dhis2.org/) instance for testing and deployment

---

### 2️⃣ Install dependencies

```bash
yarn install
```

---

### 3️⃣ Development build 🧑‍💻

Run a local development build with live reloading (using `webpack-dev-server`):

```bash
yarn start
```

This uses the configuration in [`webpack.config.js`](webpack.config.js).  
It spins up a dev server at [http://localhost:8081](http://localhost:8081) and proxies API calls to your DHIS2 instance (configured via `DHIS2_HOME/config.json`).

---

### 4️⃣ Production build 🏗️

To create a ready-to-deploy build:

```bash
yarn build
```

This uses the optimized settings from [`webpack.prod.config.js`](webpack.prod.config.js).  
The resulting files will be in the **`/build`** directory.

---

## ⚙️ Configuration

The app attempts to load a DHIS2 configuration from:
```
$DHIS2_HOME/config.json
```

If not found, it falls back to a default:

```json
{
  "baseUrl": "http://localhost:8282",
  "authorization": "Basic YWRtaW46ZGlzdHJpY3Q=" // admin:district
}
```

🔐 You can override this by setting your own `DHIS2_HOME` environment variable:
```bash
export DHIS2_HOME=/path/to/your/dhis2/config
```

---

## 📦 Packaging for DHIS2

After building, package the app into a ZIP to upload via **DHIS2 App Management**:

```bash
yarn bundle
```

Then upload the generated ZIP file through **Apps → App Management → Install app**.

---

## 🧑‍💻 Developer Notes

- Source entry: `scripts/index.js`
- Static resources: `core/`, `views/`, `common/`, `vendor/`, `styles/`, `images/`
- HTML templates under `components/`
- Build output: `build/` folder (auto-created)

---

## 🧭 Folder Structure

```
├── build/                # Compiled output (after build)
├── common/               # Shared utilities
├── components/           # AngularJS templates and controllers
├── core/                 # Core logic and services
├── data/                 # Data handling modules
├── i18n/                 # Translations
├── images/               # App icons and images
├── styles/               # CSS
├── vendor/               # External libraries
├── webpack.config.js     # Dev config
├── webpack.prod.config.js# Prod config
├── manifest.webapp       # DHIS2 manifest
└── package.json          # Project metadata & scripts
```

---

## 🌐 DHIS2 Integration Notes

- Uses the **DHIS2 Web API** for fetching and submitting results framework data.
- Authentication handled via HTTP Basic headers in the development setup.
- Production apps use DHIS2 session authentication after upload.

---

## 🤝 Contributing

💡 Pull requests are welcome!  
Before submitting, please:
1. Run a local build and test it in a DHIS2 instance.
2. Follow existing coding and naming conventions.
3. Keep commits atomic and descriptive.

---
