# Territory LIVE — mobile cloud bridge (starter)

This package serves the existing Territory LIVE HTML game and adds an unofficial TikTok LIVE event bridge. It is designed so the streamer can open the hosted game on a phone; a cloud host runs the Node.js process.

## Gift mapping
- Rose -> Netherlands (team 0)
- GG -> Morocco (team 1)
- Coffee -> USA (team 2)
- Ice Cream -> Turkey (team 3)

The four on-screen gift buttons remain manual simulation buttons. Real incoming gifts are handled by the server when the TikTok connector is able to connect.

## Important limitations
- TikTok LIVE Connector is an unofficial reverse-engineered integration, not an official TikTok API. TikTok can change it at any time.
- This service must be deployed to a Node.js host. A normal mobile browser cannot run the server process itself. You can still configure/open the hosted page from your phone.
- Set `TIKTOK_USERNAME` in the hosting provider's environment variables to the public creator username without `@`.
- The streamer account generally needs to be LIVE for the connector to attach. Test before relying on it in a public stream.
- Gift names vary by locale/account and may not match the four configured names. If an event's gift name is different, update `teamForGift()` in `server.mjs`.
- Do not add TikTok passwords, session cookies, or other account secrets to this project.

## Deploy outline (phone-friendly, but initial setup is still a few steps)
1. Create a GitHub repository and upload the contents of this folder, keeping `server.mjs`, `package.json`, `render.yaml`, `README.md`, and `public/index.html` in the repository root/folder structure.
2. In Render, create a new Web Service from that repository. Render can detect `render.yaml`; otherwise set build command `npm install`, start command `npm start`, runtime Node.
3. Add environment variable `TIKTOK_USERNAME` with your TikTok username (no `@`) and deploy.
4. Open the resulting HTTPS service URL on your phone. `/health` should show `tiktokUsernameConfigured: true`.
5. Start your TikTok LIVE from the TikTok app using its screen-broadcast/mobile-gaming option if it is available to your account, then switch to the browser showing the game. Check TikTok's current options before streaming; availability differs by account/region.

## Local development
Requires Node.js 20+:
```bash
npm install
TIKTOK_USERNAME=yourusername npm start
```
