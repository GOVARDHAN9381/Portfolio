# Narapareddy Govardhan Reddy — Portfolio

An interactive, futuristic 3D portfolio built with Next.js, React 19, Three.js / React Three Fiber, Framer Motion, Tailwind CSS, and Radix UI.

---

## 🚀 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Start production server**:
   ```bash
   npm start
   ```

---

## 🌐 Deploy to Render

### Method 1: Automatic Deployment with Render Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository: `https://github.com/GOVARDHAN9381/Portfolio.git`.
4. Render will automatically detect `render.yaml` and configure:
   - **Service Type**: Web Service
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click **Apply** to deploy.

### Method 2: Manual Web Service Setup
1. On Render Dashboard, click **New +** > **Web Service**.
2. Select your repository: `GOVARDHAN9381/Portfolio`.
3. Configure the following settings:
   - **Name**: `portfolio` (or your choice)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
5. Click **Deploy Web Service**.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: React 19, Tailwind CSS, Radix UI
- **3D & Visuals**: Three.js, React Three Fiber, Drei, Framer Motion
- **Icons**: Lucide React

