// WebAuthn Key Generator App with PWA Install Support
class WebAuthnApp {
    constructor() {
        this.currentCredential = null;
        this.deferredPrompt = null;
        this.initElements();
        this.attachEventListeners();
        this.registerServiceWorker();
        this.setupPWAInstall();
        this.updateStatus();
        this.logPWAStatus();
    }

    initElements() {
        this.generateBtn = document.getElementById('generateBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.display = document.getElementById('display');
        this.info = document.getElementById('info');
        this.publicKeyDisplay = document.getElementById('publicKeyDisplay');
        this.publicKeyBase64 = document.getElementById('publicKeyBase64');
        this.jsonDisplay = document.getElementById('jsonDisplay');
        this.algorithmValue = document.getElementById('algorithmValue');
        this.keyTypeValue = document.getElementById('keyTypeValue');
        this.curveValue = document.getElementById('curveValue');
        this.generatedValue = document.getElementById('generatedValue');
        this.statusText = document.getElementById('statusText');
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
        this.installPrompt = document.getElementById('installPrompt');
        this.installBtn = document.getElementById('installBtn');
        this.dismissBtn = document.getElementById('dismissBtn');
    }

    attachEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateKeys());
        this.copyBtn.addEventListener('click', () => this.copyPublicKey());
        this.clearBtn.addEventListener('click', () => this.clearDisplay());
        this.installBtn.addEventListener('click', () => this.installApp());
        this.dismissBtn.addEventListener('click', () => this.dismissInstall());
    }

    setupPWAInstall() {
        console.log('🔧 Setting up PWA install listeners...');

        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('✅ beforeinstallprompt fired!');
            // Prevent the mini-infobar from appearing
            e.preventDefault();
            // Store the event for later use
            this.deferredPrompt = e;
            // Show our custom install prompt
            this.showInstallPrompt();
        });

        // Handle app installed
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA was installed');
            this.showNotification('App installed successfully!');
            this.dismissInstall();
        });

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('ℹ️ App is running in standalone mode');
            this.installPrompt.style.display = 'none';
        } else {
            console.log('ℹ️ App is running in browser mode');
        }

        // Fallback: Show install prompt after delay if beforeinstallprompt doesn't fire
        setTimeout(() => {
            if (!this.deferredPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
                console.log('⚠️ beforeinstallprompt did not fire. Showing fallback UI.');
                this.showFallbackInstallPrompt();
            }
        }, 3000);
    }

    showFallbackInstallPrompt() {
        // Show fallback UI with manual installation instructions
        const fallbackHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: #1a1a1a; border: 2px solid #00ff00; padding: 30px; 
                        border-radius: 8px; text-align: center; z-index: 10000; max-width: 400px;
                        box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);">
                <h2 style="color: #00ff00; margin-bottom: 20px; font-family: monospace;">📱 Install App</h2>
                <p style="color: #e0e0e0; margin-bottom: 20px; font-family: monospace; line-height: 1.8;">
                    <strong>Desktop Chrome:</strong><br>
                    Click ⊕ icon in address bar<br><br>
                    <strong>Mobile Chrome:</strong><br>
                    Menu ⋮ → "Add to home screen"<br><br>
                    <strong>Firefox/Safari:</strong><br>
                    Not yet supported
                </p>
                <button id="closeFallback" style="padding: 10px 20px; background: #00ff00; 
                        color: #0a0a0a; border: none; border-radius: 4px; 
                        font-weight: bold; cursor: pointer; font-family: monospace;">Close</button>
            </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = fallbackHTML;
        document.body.appendChild(div);

        document.getElementById('closeFallback').addEventListener('click', () => {
            div.remove();
        });
    }

    logPWAStatus() {
        console.group('📱 PWA Status Check');
        console.log('📍 URL:', window.location.href);
        console.log('🔒 HTTPS:', window.location.protocol === 'https:' ? '✅' : '❌ (need HTTPS)');
        console.log('📦 Manifest:', document.querySelector('link[rel="manifest"]') ? '✅' : '❌');
        console.log('🔧 Service Worker:', 'serviceWorker' in navigator ? '✅' : '❌');
        console.log('📲 Standalone mode:', window.matchMedia('(display-mode: standalone)').matches ? '✅' : '❌');
        console.log('🎯 beforeinstallprompt support:', 'onbeforeinstallprompt' in window ? '✅' : '❌');
        console.log('🌐 Browser:', this.detectBrowser());
        console.groupEnd();
    }

    detectBrowser() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome ✅';
        if (ua.includes('Firefox')) return 'Firefox (limited support)';
        if (ua.includes('Safari')) return 'Safari (not supported)';
        if (ua.includes('Edge')) return 'Edge ✅';
        return 'Unknown';
    }

    showInstallPrompt() {
        if (this.deferredPrompt) {
            this.installPrompt.style.display = 'block';
            document.body.classList.add('install-visible');
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            console.warn('⚠️ deferredPrompt is not available');
            this.showNotification('Use browser menu: Chrome icon or menu ⋮', 'error');
            return;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`📝 User response: ${outcome}`);
            
            // Clear the deferred prompt
            this.deferredPrompt = null;
            this.dismissInstall();
            
            if (outcome === 'accepted') {
                this.showNotification('Installing app...');
            } else {
                this.showNotification('Installation dismissed');
            }
        } catch (error) {
            console.error('❌ Error during installation:', error);
            this.showNotification('Installation failed', 'error');
        }
    }

    dismissInstall() {
        this.installPrompt.style.display = 'none';
        document.body.classList.remove('install-visible');
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('sw.js');
                console.log('✅ Service Worker registered:', registration.scope);
                this.updateStatus();
            } catch (error) {
                console.log('❌ Service Worker registration failed:', error);
            }
        }
    }

    updateStatus() {
        if ('serviceWorker' in navigator && 'onLine' in navigator) {
            const swRegistered = navigator.serviceWorker.controller ? 'yes' : 'no';
            const online = navigator.onLine ? 'Online' : 'Offline';
            this.statusText.textContent = `${online} • SW: ${swRegistered}`;
        }
    }

    async generateKeys() {
        try {
            this.generateBtn.disabled = true;
            this.statusText.textContent = 'Generating...';

            // Create credential with WebAuthn
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: this.generateChallenge(),
                    rp: {
                        name: "WebAuthn Key Generator",
                        id: window.location.hostname || "localhost"
                    },
                    user: {
                        id: this.generateUserId(),
                        name: "user@example.com",
                        displayName: "WebAuthn User"
                    },
                    pubKeyCredParams: [
                        { alg: -7, type: "public-key" },  // ES256
                        { alg: -257, type: "public-key" } // RS256
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: "platform",
                        userVerification: "preferred"
                    },
                    timeout: 60000,
                    attestation: "direct"
                }
            });

            if (!credential) {
                throw new Error('Credential creation cancelled');
            }

            this.currentCredential = credential;
            this.displayKeys();
            this.showNotification('Keys generated successfully!');
            this.statusText.textContent = 'Keys generated ✓';
            this.copyBtn.disabled = false;
            this.clearBtn.disabled = false;

        } catch (error) {
            console.error('Error generating keys:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
            this.statusText.textContent = 'Generation failed';
        } finally {
            this.generateBtn.disabled = false;
        }
    }

    displayKeys() {
        if (!this.currentCredential) return;

        const attestationObject = this.parseAttestationObject(
            new Uint8Array(this.currentCredential.response.attestationObject)
        );

        const publicKeyData = this.extractPublicKey(attestationObject);
        
        // Display sections
        this.display.style.display = 'block';
        this.info.style.display = 'none';

        // Public key display
        this.publicKeyDisplay.textContent = JSON.stringify(publicKeyData, null, 2);
        
        // Base64 display
        const publicKeyBytes = this.coseToBytes(publicKeyData);
        const base64String = this.bytesToBase64(publicKeyBytes);
        this.publicKeyBase64.textContent = base64String;

        // JSON display
        this.jsonDisplay.textContent = JSON.stringify({
            id: this.arrayBufferToBase64(this.currentCredential.id),
            publicKey: publicKeyData,
            type: this.currentCredential.type,
            transports: this.currentCredential.response.getTransports?.() || []
        }, null, 2);

        // Details
        this.algorithmValue.textContent = this.getAlgorithmName(publicKeyData.alg);
        this.keyTypeValue.textContent = 'EC2';
        this.curveValue.textContent = this.getCurveName(publicKeyData.crv);
        this.generatedValue.textContent = new Date().toLocaleString();
    }

    parseAttestationObject(bytes) {
        return this.decodeCBOR(bytes);
    }

    extractPublicKey(attestationObject) {
        const authData = attestationObject.authData;
        const credentialPublicKey = this.decodeCBOR(authData.slice(-77));
        return credentialPublicKey;
    }

    decodeCBOR(bytes) {
        // Simplified CBOR decoder for COSE keys
        const view = new DataView(new ArrayBuffer(bytes.length));
        for (let i = 0; i < bytes.length; i++) {
            view.setUint8(i, bytes[i]);
        }

        const result = {};
        let offset = 0;

        if (bytes[0] === 0xA5) { // CBOR map with 5 items
            offset = 1;
            
            // Parse key-value pairs
            while (offset < bytes.length && Object.keys(result).length < 5) {
                const keyByte = bytes[offset++];
                
                if (keyByte >= 0x00 && keyByte <= 0x18) {
                    const key = keyByte;
                    const valueByte = bytes[offset++];
                    
                    if (key === 1) result.kty = valueByte; // Key type
                    else if (key === 3) result.alg = this.decodeCBORInt(bytes, offset - 1);
                    else if (key === -1) result.crv = valueByte; // Curve
                    else if (key === -2 || key === -3) {
                        // X or Y coordinate - handle variable length
                        const len = this.getCBORLength(bytes, offset - 1);
                        result[key === -2 ? 'x' : 'y'] = bytes.slice(offset, offset + len);
                        offset += len;
                    }
                }
            }
        }

        // Fallback: try to extract from raw authData
        if (!result.kty) {
            result.kty = 2; // EC2
            result.alg = -7; // ES256
            result.crv = 1; // P-256
        }

        return result;
    }

    decodeCBORInt(bytes, offset) {
        const byte = bytes[offset];
        if (byte === 0x27) return -8;
        if (byte === 0x26) return -7;
        if (byte >= 0x00 && byte <= 0x17) return byte;
        if (byte >= 0x20 && byte <= 0x37) return -(byte - 0x20 + 1);
        return 0;
    }

    getCBORLength(bytes, offset) {
        const byte = bytes[offset];
        if (byte >= 0x40 && byte <= 0x57) return byte - 0x40;
        if (byte >= 0x58 && byte <= 0x5B) return bytes[offset + 1];
        return 32; // Default for coordinates
    }

    coseToBytes(coseKey) {
        // Simple serialization
        const parts = [];
        if (coseKey.x) parts.push(...coseKey.x);
        if (coseKey.y) parts.push(...coseKey.y);
        return new Uint8Array(parts);
    }

    getAlgorithmName(alg) {
        const algorithms = {
            '-7': 'ES256 (ECDSA with SHA-256)',
            '-257': 'RS256 (RSA with SHA-256)',
            '-8': 'EdDSA'
        };
        return algorithms[String(alg)] || `ALG-${alg}`;
    }

    getCurveName(crv) {
        const curves = {
            '1': 'P-256 (secp256r1)',
            '2': 'P-384 (secp384r1)',
            '3': 'P-521 (secp521r1)',
            '6': 'Ed25519'
        };
        return curves[String(crv)] || `CRV-${crv}`;
    }

    copyPublicKey() {
        const text = this.publicKeyDisplay.textContent;
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Public key copied!');
        }).catch(() => {
            this.showNotification('Failed to copy', 'error');
        });
    }

    clearDisplay() {
        this.display.style.display = 'none';
        this.info.style.display = 'block';
        this.currentCredential = null;
        this.copyBtn.disabled = true;
        this.clearBtn.disabled = true;
        this.statusText.textContent = 'Ready';
    }

    showNotification(message, type = 'success') {
        this.notificationText.textContent = message;
        this.notification.style.display = 'block';
        setTimeout(() => {
            this.notification.style.display = 'none';
        }, 3000);
    }

    generateChallenge() {
        return crypto.getRandomValues(new Uint8Array(32));
    }

    generateUserId() {
        return crypto.getRandomValues(new Uint8Array(16));
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    bytesToBase64(bytes) {
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WebAuthnApp();
    });
} else {
    new WebAuthnApp();
}
