<br>

<p align="center">
  <a href="https://ziolken.pages.dev" target="_blank" rel="noopener noreferrer">
    <img src="./favicon.ico" alt="ZiolKen Website" height="240" width="240" style="border-radius: 18px;" />
  </a>
</p>

# <p align="center">ziolken.github.io</p>

<div>
  <img style="width: 100%;" src="https://capsule-render.vercel.app/api?type=waving&height=110&section=header&fontSize=60&fontColor=FFFFFF&fontAlign=50&fontAlignY=40&descSize=18&descAlign=50&descAlignY=70&theme=cobalt" />
</div>

### <p align="center">Modern Personal Portfolio / Link-in-Bio — Static, Fast, Deploy Anywhere</p>

<p align="center">
  <a href="https://ziolken.vercel.app"><img src="https://img.shields.io/badge/Live-Vercel-6366f1?style=for-the-badge"></a>
  <a href="https://ziolken.pages.dev"><img src="https://img.shields.io/badge/Live-Cloudflare-f97316?style=for-the-badge"></a>
  <a href="https://ziolken.github.io"><img src="https://img.shields.io/badge/Live-GitHub%20Pages-18181b?style=for-the-badge"></a>
  <a href="https://ziolken.netlify.app"><img src="https://img.shields.io/badge/Live-Netlify-14b8a6?style=for-the-badge"></a>
</p>

<p align="center">
  <a href="https://github.com/ZiolKen/ziolken.github.io/stargazers"><img src="https://img.shields.io/github/stars/ZiolKen/ziolken.github.io?style=flat"></a>
  <a href="https://github.com/ZiolKen/ziolken.github.io/blob/main/LICENSE"><img src="https://img.shields.io/github/license/ZiolKen/ziolken.github.io?style=flat"></a>
  <a href="https://github.com/ZiolKen/ziolken.github.io/forks"><img src="https://img.shields.io/github/forks/ZiolKen/ziolken.github.io?style=flat"></a>
  <a href="https://github.com/ZiolKen/ziolken.github.io/commits/main"><img src="https://img.shields.io/github/last-commit/ZiolKen/ziolken.github.io?style=flat"></a>
</p>

---

## 👋 About

This repository contains the source code for my personal portfolio and link-in-bio website. It's a modern, feature-rich, and interactive hub showcasing my projects, social links, and real-time status. The entire site is built with vanilla HTML, CSS, and JavaScript, demonstrating a range of front-end capabilities without relying on external frameworks.

---

## 🧩 What you’ll typically find here

- A clean homepage (`index.html`) with your intro + links
- Styles and UI polish in `style.css`
- Small interactions and effects in `app.js`
- Assets (images, icons, fonts) organized under `assets/`, `res/`, `fonts/`

---

## Features

This portfolio is packed with dynamic and interactive features:

*   **Real-time Discord Presence:** Connects to the Lanyard WebSocket API to display my live Discord status (Online, Idle, DND), custom status message, and active devices (Desktop, Web, Mobile).
*   **Interactive Web Terminal:** A fully functional terminal emulator with command history, tab-based autocompletion, and a variety of built-in commands, including:
    *   **Utilities:** `help`, `about`, `clear`, `history`, `echo`, `date`
    *   **Networking:** `ping`, `curl`, `dig` (via Cloudflare DoH), `ip`, `rdap`
    *   **Crypto & Encoding:** `sha256`, `base64`, `jwt`, `passgen`
    *   **APIs:** `weather` (from Open-Meteo), `projects` (from GitHub)
    *   **Site Interaction:** `music`, `play`, `pause`, `theme`
*   **Featured Projects Showcase:** Dynamically fetches and displays my latest updated repositories from GitHub that have a live deployment URL. The showcase is presented as an infinite marquee animation.
*   **Integrated Music Player:** A custom-built audio player with play/pause, next/prev, a seekable progress bar, and a real-time audio visualizer connected to the audio output.
*   **Dynamic Content:**
    *   A local time display for my timezone.
    *   An animated "cypher text" effect.
    *   Dynamic page titles that cycle through different phrases.
*   **Responsive Design:** A clean, multi-column layout that adapts smoothly from desktop to mobile devices.

---

## Technology Stack

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **APIs:**
    *   [Lanyard API](https://lanyard.rest/): For real-time Discord presence.
    *   [GitHub API](https://docs.github.com/en/rest): For fetching repository information.
    *   [Open-Meteo API](https://open-meteo.com/): For weather data in the terminal.
    *   [Cloudflare DNS over HTTPS](https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/): For the `dig` terminal command.
*   **Deployment:** The site is deployed on Vercel, Cloudflare Pages, and GitHub Pages.

---

## Configuration & Customization

If you wish to fork this repository for your own use, you will need to update several parts of the code to personalize it:

1.  **`index.html`**:
    *   Update the "About Me" section with your personal information.
    *   Change the social and contact links to your own profiles.
    *   Modify the page metadata (title, description, etc.).

2.  **`app.js`**:
    *   Change the `discordId` in the `CONFIG` object to your own Discord user ID to fetch your presence.

3.  **`src/script.js`**:
    *   In the `FeaturedProjects` module, change the `owner` variable to your GitHub username to display your projects.

4.  **`src/music.js`**:
    *   Update the `tracks` array with your desired songs, including title, artist, source file path, and cover image path.

5.  **`src/terminal.js`**:
    *   In the `initTerminal` function, update the `ghOwner` variable to your GitHub username for the `projects` command.
    *   Modify the output of the `contact` command.

---

## 🚀 Run locally

```bash
npx serve .
```

or

```bash
python -m http.server 8080
```

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## ❤️ Credits

Created and maintained by **[ZiolKen](https://github.com/ZiolKen)**.

---

## ☕ Support

If you find this helpful:

[![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/_zkn)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/zkn0461)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://patreon.com/ZiolKen)

<div>
  <img style="width: 100%;" src="https://capsule-render.vercel.app/api?type=waving&height=110&section=footer&fontSize=60&fontColor=FFFFFF&fontAlign=50&fontAlignY=40&descSize=18&descAlign=50&descAlignY=70&theme=cobalt" />
</div>