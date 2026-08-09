import fs from 'fs';
import path from 'path';

const imgDir = path.join(process.cwd(), 'public', 'static', 'images');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// Generate an SVG for UPI QR Code
const upiQrSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="#111827" rx="16"/>
  <rect x="15" y="15" width="270" height="270" fill="none" stroke="#00f0ff" stroke-width="2" stroke-dasharray="8,4" rx="12"/>
  
  <!-- QR Finder Pattern Top-Left -->
  <rect x="35" y="35" width="60" height="60" fill="#00f0ff" rx="8"/>
  <rect x="45" y="45" width="40" height="40" fill="#111827" rx="4"/>
  <rect x="53" y="53" width="24" height="24" fill="#00f0ff" rx="2"/>

  <!-- QR Finder Pattern Top-Right -->
  <rect x="205" y="35" width="60" height="60" fill="#00f0ff" rx="8"/>
  <rect x="215" y="45" width="40" height="40" fill="#111827" rx="4"/>
  <rect x="223" y="53" width="24" height="24" fill="#00f0ff" rx="2"/>

  <!-- QR Finder Pattern Bottom-Left -->
  <rect x="35" y="205" width="60" height="60" fill="#00f0ff" rx="8"/>
  <rect x="45" y="215" width="40" height="40" fill="#111827" rx="4"/>
  <rect x="53" y="223" width="24" height="24" fill="#00f0ff" rx="2"/>

  <!-- QR Data Blocks -->
  <rect x="110" y="35" width="20" height="20" fill="#10b981" rx="2"/>
  <rect x="140" y="35" width="15" height="15" fill="#00f0ff" rx="2"/>
  <rect x="165" y="35" width="25" height="20" fill="#10b981" rx="2"/>

  <rect x="110" y="65" width="30" height="20" fill="#00f0ff" rx="2"/>
  <rect x="150" y="60" width="20" height="30" fill="#10b981" rx="2"/>
  <rect x="180" y="70" width="15" height="25" fill="#00f0ff" rx="2"/>

  <rect x="35" y="110" width="20" height="30" fill="#10b981" rx="2"/>
  <rect x="65" y="120" width="30" height="20" fill="#00f0ff" rx="2"/>
  <rect x="110" y="105" width="40" height="40" fill="#00f0ff" rx="4"/>
  <rect x="160" y="110" width="35" height="20" fill="#10b981" rx="2"/>
  <rect x="210" y="110" width="25" height="25" fill="#00f0ff" rx="2"/>
  <rect x="245" y="105" width="20" height="35" fill="#10b981" rx="2"/>

  <rect x="110" y="155" width="25" height="30" fill="#10b981" rx="2"/>
  <rect x="145" y="160" width="35" height="25" fill="#00f0ff" rx="2"/>
  <rect x="190" y="150" width="25" height="35" fill="#10b981" rx="2"/>
  <rect x="225" y="155" width="40" height="20" fill="#00f0ff" rx="2"/>

  <rect x="110" y="205" width="20" height="20" fill="#00f0ff" rx="2"/>
  <rect x="140" y="210" width="30" height="25" fill="#10b981" rx="2"/>
  <rect x="180" y="205" width="20" height="40" fill="#00f0ff" rx="2"/>
  <rect x="210" y="215" width="35" height="20" fill="#10b981" rx="2"/>

  <rect x="110" y="245" width="35" height="20" fill="#10b981" rx="2"/>
  <rect x="155" y="240" width="25" height="25" fill="#00f0ff" rx="2"/>
  <rect x="190" y="250" width="30" height="15" fill="#10b981" rx="2"/>
  <rect x="230" y="245" width="25" height="20" fill="#00f0ff" rx="2"/>

  <!-- Center Logo / Tag -->
  <rect x="120" y="120" width="60" height="60" fill="#1f2937" stroke="#00f0ff" stroke-width="2" rx="10"/>
  <text x="150" y="150" fill="#00f0ff" font-family="sans-serif" font-weight="bold" font-size="14" text-anchor="middle" dominant-baseline="middle">UPI</text>
  <text x="150" y="165" fill="#10b981" font-family="sans-serif" font-weight="bold" font-size="9" text-anchor="middle">₹99/CR</text>

  <!-- Footer Info -->
  <text x="150" y="285" fill="#9ca3af" font-family="sans-serif" font-size="10" text-anchor="middle">9569086611-2@ybl (Amit)</text>
</svg>`;

const garenaLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60">
  <rect width="200" height="60" fill="none"/>
  <path d="M 10 30 L 25 10 L 40 30 L 25 50 Z" fill="#ef4444"/>
  <path d="M 25 20 L 35 30 L 25 40 L 15 30 Z" fill="#f59e0b"/>
  <text x="50" y="38" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="22" letter-spacing="1">BINDSTORE</text>
  <text x="50" y="50" fill="#00f0ff" font-family="sans-serif" font-size="9" letter-spacing="2">GARENA BIND SERVICE</text>
</svg>`;

fs.writeFileSync(path.join(imgDir, 'upi-qr.svg'), upiQrSvg, 'utf-8');
fs.writeFileSync(path.join(imgDir, 'garena-logo.svg'), garenaLogoSvg, 'utf-8');

console.log('Generated SVG assets in public/static/images');
