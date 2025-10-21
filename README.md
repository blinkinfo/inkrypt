# inkrypt 🔐

A secure, open-source, client-side encryption and decryption web application. All cryptographic operations happen locally in your browser - your data never leaves your device.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-19.1-blue)
![Vite](https://img.shields.io/badge/Vite-7.1-blue)

## Features

- **Military-Grade Encryption**: AES-256-GCM with PBKDF2 key derivation
- **Maximum Security**: 600,000 PBKDF2 iterations (OWASP 2023 recommendation)
- **100% Client-Side**: All encryption happens in your browser using Web Crypto API
- **Zero Data Collection**: No data is ever sent to any server
- **Modern UI**: Clean, minimal design built with shadcn/ui and Tailwind CSS
- **Mobile-First**: Fully responsive design that works on all devices
- **Open Source**: Fully transparent and auditable code

## Security Details

inkrypt uses industry-standard cryptographic algorithms:

### Encryption Algorithm
- **AES-256-GCM**: Advanced Encryption Standard with 256-bit keys in Galois/Counter Mode
  - Provides both confidentiality and authenticity
  - Resistant to tampering and forgery attacks

### Key Derivation
- **PBKDF2**: Password-Based Key Derivation Function 2
  - 600,000 iterations (exceeds OWASP 2023 recommendation of 600,000)
  - SHA-256 hash function
  - Random 128-bit salt for each encryption
  - Protects against brute-force and rainbow table attacks

### Implementation
- Uses browser's native **Web Crypto API** (built-in, secure, and fast)
- Random 96-bit IV (Initialization Vector) for each encryption
- Base64 encoding for easy copy/paste
- No password storage or caching

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/inkrypt.git
cd inkrypt

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## Usage

### Encrypting Text

1. Select the "Encrypt" tab
2. Enter your text in the "Text to Encrypt" field
3. Enter a strong password
4. Click "Encrypt"
5. Copy the encrypted result

### Decrypting Text

1. Select the "Decrypt" tab
2. Paste the encrypted text
3. Enter the same password used for encryption
4. Click "Decrypt"
5. View your decrypted message

## Security Best Practices

When using inkrypt:

1. **Use Strong Passwords**: Use long, random passwords with mixed characters
2. **Never Reuse Passwords**: Use unique passwords for different messages
3. **Secure Password Sharing**: Share passwords through secure, separate channels
4. **Verify Integrity**: Ensure encrypted text hasn't been modified
5. **Browser Security**: Use updated browsers and avoid public/untrusted devices

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **lucide-react** - Beautiful icons
- **Web Crypto API** - Browser cryptography

## Project Structure

```
inkrypt/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── lib/
│   │   ├── crypto.ts    # Encryption/decryption logic
│   │   └── utils.ts     # Utility functions
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
└── package.json         # Dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

While inkrypt uses industry-standard encryption algorithms and best practices, no encryption tool is 100% secure. Always:

- Keep your passwords secure
- Use strong, unique passwords
- Be aware of your threat model
- Don't use this for highly sensitive data without understanding the risks
- This tool is provided as-is with no warranties

## Support

If you encounter any issues or have questions:

- Open an issue on GitHub
- Check existing issues for solutions

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Uses [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- Follows [OWASP](https://owasp.org/) security recommendations

---

Made with security in mind. Remember to use strong, unique passwords.
