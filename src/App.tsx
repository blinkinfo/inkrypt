import { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Copy, Eye, EyeOff, ShieldCheck, Download, File, Loader2, CheckCircle2, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { PasswordStrength } from '@/components/PasswordStrength';
import { ToastContainer, type Toast } from '@/components/ui/toast';
import { encrypt, decrypt, encryptFile, decryptFile } from '@/lib/crypto';
import { readFileAsArrayBuffer, downloadFile, validateFileSize, sanitizeFileName } from '@/lib/fileUtils';

function App() {
  // Encrypt state
  const [plaintext, setPlaintext] = useState('');
  const [encryptPassword, setEncryptPassword] = useState('');
  const [encryptedResult, setEncryptedResult] = useState('');
  const [showEncryptPassword, setShowEncryptPassword] = useState(false);

  // Decrypt state
  const [ciphertext, setCiphertext] = useState('');
  const [decryptPassword, setDecryptPassword] = useState('');
  const [decryptedResult, setDecryptedResult] = useState('');
  const [showDecryptPassword, setShowDecryptPassword] = useState(false);

  // File encryption state
  const [fileToEncrypt, setFileToEncrypt] = useState<File | null>(null);
  const [fileEncryptPassword, setFileEncryptPassword] = useState('');
  const [showFileEncryptPassword, setShowFileEncryptPassword] = useState(false);
  const fileEncryptInputRef = useRef<HTMLInputElement>(null);

  // File decryption state
  const [fileToDecrypt, setFileToDecrypt] = useState<File | null>(null);
  const [fileDecryptPassword, setFileDecryptPassword] = useState('');
  const [showFileDecryptPassword, setShowFileDecryptPassword] = useState(false);
  const fileDecryptInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('inkrypt-active-tab') || 'encrypt';
  });

  // Auto-focus refs
  const plaintextRef = useRef<HTMLTextAreaElement>(null);
  const ciphertextRef = useRef<HTMLTextAreaElement>(null);

  // Toast management
  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Persist active tab
  useEffect(() => {
    localStorage.setItem('inkrypt-active-tab', activeTab);
  }, [activeTab]);

  const handleEncrypt = async () => {
    setEncryptedResult('');

    if (!plaintext.trim()) {
      showToast('error', 'Please enter text to encrypt');
      plaintextRef.current?.focus();
      return;
    }

    if (!encryptPassword) {
      showToast('error', 'Please enter a password');
      return;
    }

    setLoading(true);
    try {
      const result = await encrypt(plaintext, encryptPassword);
      setEncryptedResult(result);
      showToast('success', 'Text encrypted successfully!');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    setDecryptedResult('');

    if (!ciphertext.trim()) {
      showToast('error', 'Please enter text to decrypt');
      ciphertextRef.current?.focus();
      return;
    }

    if (!decryptPassword) {
      showToast('error', 'Please enter a password');
      return;
    }

    setLoading(true);
    try {
      const result = await decrypt(ciphertext, decryptPassword);
      setDecryptedResult(result);
      showToast('success', 'Text decrypted successfully!');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Decryption failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', 'Copied to clipboard!');
    } catch {
      showToast('error', 'Failed to copy to clipboard');
    }
  };

  const clearEncryptForm = () => {
    if (plaintext || encryptPassword || encryptedResult) {
      if (!confirm('Clear all fields? This action cannot be undone.')) return;
    }
    setPlaintext('');
    setEncryptPassword('');
    setEncryptedResult('');
    plaintextRef.current?.focus();
  };

  const clearDecryptForm = () => {
    if (ciphertext || decryptPassword || decryptedResult) {
      if (!confirm('Clear all fields? This action cannot be undone.')) return;
    }
    setCiphertext('');
    setDecryptPassword('');
    setDecryptedResult('');
    ciphertextRef.current?.focus();
  };

  // File encryption handlers
  const handleFileEncryptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileSize(file, 100)) {
      showToast('error', 'File size must be less than 100MB');
      return;
    }

    setFileToEncrypt(file);
    showToast('success', `File selected: ${file.name}`);
  };

  const handleFileEncrypt = async () => {
    if (!fileToEncrypt) {
      showToast('error', 'Please select a file to encrypt');
      return;
    }

    if (!fileEncryptPassword) {
      showToast('error', 'Please enter a password');
      return;
    }

    setLoading(true);
    try {
      const fileData = await readFileAsArrayBuffer(fileToEncrypt);
      const encryptedData = await encryptFile(fileData, fileToEncrypt.name, fileEncryptPassword);

      // Generate encrypted filename
      const encryptedFileName = sanitizeFileName(fileToEncrypt.name) + '.encrypted';

      // Download encrypted file
      downloadFile(encryptedData, encryptedFileName);

      showToast('success', `File encrypted! Downloading: ${encryptedFileName}`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'File encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFileEncryptForm = () => {
    if (fileToEncrypt || fileEncryptPassword) {
      if (!confirm('Clear file and password? This action cannot be undone.')) return;
    }
    setFileToEncrypt(null);
    setFileEncryptPassword('');
    if (fileEncryptInputRef.current) {
      fileEncryptInputRef.current.value = '';
    }
  };

  // File decryption handlers
  const handleFileDecryptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileSize(file, 100)) {
      showToast('error', 'File size must be less than 100MB');
      return;
    }

    setFileToDecrypt(file);
    showToast('success', `File selected: ${file.name}`);
  };

  const handleFileDecrypt = async () => {
    if (!fileToDecrypt) {
      showToast('error', 'Please select a file to decrypt');
      return;
    }

    if (!fileDecryptPassword) {
      showToast('error', 'Please enter a password');
      return;
    }

    setLoading(true);
    try {
      const fileData = await readFileAsArrayBuffer(fileToDecrypt);
      const { data, fileName } = await decryptFile(fileData, fileDecryptPassword);

      // Download decrypted file with original name
      const decryptedFileName = sanitizeFileName(fileName);
      downloadFile(data, decryptedFileName);

      showToast('success', `File decrypted! Downloading: ${decryptedFileName}`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'File decryption failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFileDecryptForm = () => {
    if (fileToDecrypt || fileDecryptPassword) {
      if (!confirm('Clear file and password? This action cannot be undone.')) return;
    }
    setFileToDecrypt(null);
    setFileDecryptPassword('');
    if (fileDecryptInputRef.current) {
      fileDecryptInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="relative text-center mb-8 animate-fade-in">
          <a
            href="https://github.com/blinkinfo/inkrypt"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-0 right-0 p-2 rounded-lg hover:bg-muted/50 transition-all group"
            aria-label="View on GitHub"
          >
            <Github className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </a>
          <div className="inline-flex items-center justify-center gap-2.5 mb-2">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              inkrypt
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Client-side encryption for your sensitive data
          </p>
        </header>

        {/* Main Card */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-6 pb-4 border-b">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="encrypt">
                    <Lock className="w-4 h-4 mr-2" />
                    Encrypt
                  </TabsTrigger>
                  <TabsTrigger value="decrypt">
                    <Unlock className="w-4 h-4 mr-2" />
                    Decrypt
                  </TabsTrigger>
                  <TabsTrigger value="file">
                    <File className="w-4 h-4 mr-2" />
                    File
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Encrypt Tab */}
              <TabsContent value="encrypt" className="space-y-6 p-6 sm:p-8 m-0">
                <div className="space-y-3">
                  <Label htmlFor="plaintext" className="text-sm font-medium text-foreground">Message</Label>
                  <Textarea
                    ref={plaintextRef}
                    id="plaintext"
                    placeholder="Type your message here..."
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="encrypt-password" className="text-sm font-medium text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="encrypt-password"
                      type={showEncryptPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={encryptPassword}
                      onChange={(e) => setEncryptPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEncrypt()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEncryptPassword(!showEncryptPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted/50"
                      aria-label={showEncryptPassword ? 'Hide password' : 'Show password'}
                    >
                      {showEncryptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={encryptPassword} show={encryptPassword.length > 0} />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleEncrypt} disabled={loading} size="lg" className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Encrypting...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Encrypt
                      </>
                    )}
                  </Button>
                  <Button onClick={clearEncryptForm} variant="outline" disabled={loading} size="lg">
                    Clear
                  </Button>
                </div>

                {encryptedResult && (
                  <div className="space-y-3 animate-slide-in pt-4 border-t">
                    <Label htmlFor="encrypted-result" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Encrypted Message
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="encrypted-result"
                        value={encryptedResult}
                        readOnly
                        className="font-mono bg-muted/50"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(encryptedResult)}
                        className="absolute right-2 top-2"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Decrypt Tab */}
              <TabsContent value="decrypt" className="space-y-6 p-6 sm:p-8 m-0">
                <div className="space-y-3">
                  <Label htmlFor="ciphertext" className="text-sm font-medium text-foreground">Encrypted Message</Label>
                  <Textarea
                    ref={ciphertextRef}
                    id="ciphertext"
                    placeholder="Paste encrypted message here..."
                    value={ciphertext}
                    onChange={(e) => setCiphertext(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="decrypt-password" className="text-sm font-medium text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="decrypt-password"
                      type={showDecryptPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={decryptPassword}
                      onChange={(e) => setDecryptPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDecrypt()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDecryptPassword(!showDecryptPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted/50"
                      aria-label={showDecryptPassword ? 'Hide password' : 'Show password'}
                    >
                      {showDecryptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleDecrypt} disabled={loading} size="lg" className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Decrypting...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Decrypt
                      </>
                    )}
                  </Button>
                  <Button onClick={clearDecryptForm} variant="outline" disabled={loading} size="lg">
                    Clear
                  </Button>
                </div>

                {decryptedResult && (
                  <div className="space-y-3 animate-slide-in pt-4 border-t">
                    <Label htmlFor="decrypted-result" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Decrypted Message
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="decrypted-result"
                        value={decryptedResult}
                        readOnly
                        className="bg-muted/50"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(decryptedResult)}
                        className="absolute right-2 top-2"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* File Tab */}
              <TabsContent value="file" className="space-y-8 p-6 sm:p-8 m-0">
                {/* File Encryption Section */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Encrypt File</h3>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="file-encrypt-input" className="text-sm font-medium text-foreground">File</Label>
                    <FileUpload
                      id="file-encrypt-input"
                      file={fileToEncrypt}
                      onFileSelect={handleFileEncryptSelect}
                      onClear={() => {
                        setFileToEncrypt(null);
                        if (fileEncryptInputRef.current) {
                          fileEncryptInputRef.current.value = '';
                        }
                      }}
                      disabled={loading}
                      inputRef={fileEncryptInputRef}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="file-encrypt-password" className="text-sm font-medium text-foreground">Password</Label>
                    <div className="relative">
                      <Input
                        id="file-encrypt-password"
                        type={showFileEncryptPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={fileEncryptPassword}
                        onChange={(e) => setFileEncryptPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowFileEncryptPassword(!showFileEncryptPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted/50"
                        aria-label={showFileEncryptPassword ? 'Hide password' : 'Show password'}
                      >
                        {showFileEncryptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={fileEncryptPassword} show={fileEncryptPassword.length > 0} />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleFileEncrypt} disabled={loading || !fileToEncrypt} size="lg" className="flex-1">
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Encrypting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Encrypt & Download
                        </>
                      )}
                    </Button>
                    <Button onClick={clearFileEncryptForm} variant="outline" disabled={loading} size="lg">
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="border-t" />

                {/* File Decryption Section */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5">
                    <Unlock className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Decrypt File</h3>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="file-decrypt-input" className="text-sm font-medium text-foreground">Encrypted File</Label>
                    <FileUpload
                      id="file-decrypt-input"
                      file={fileToDecrypt}
                      onFileSelect={handleFileDecryptSelect}
                      onClear={() => {
                        setFileToDecrypt(null);
                        if (fileDecryptInputRef.current) {
                          fileDecryptInputRef.current.value = '';
                        }
                      }}
                      disabled={loading}
                      accept=".encrypted"
                      inputRef={fileDecryptInputRef}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="file-decrypt-password" className="text-sm font-medium text-foreground">Password</Label>
                    <div className="relative">
                      <Input
                        id="file-decrypt-password"
                        type={showFileDecryptPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={fileDecryptPassword}
                        onChange={(e) => setFileDecryptPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowFileDecryptPassword(!showFileDecryptPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted/50"
                        aria-label={showFileDecryptPassword ? 'Hide password' : 'Show password'}
                      >
                        {showFileDecryptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleFileDecrypt} disabled={loading || !fileToDecrypt} size="lg" className="flex-1">
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Decrypting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Decrypt & Download
                        </>
                      )}
                    </Button>
                    <Button onClick={clearFileDecryptForm} variant="outline" disabled={loading} size="lg">
                      Clear
                    </Button>
                  </div>
                </div>

                {/* File Info */}
                <div className="bg-muted/30 rounded-lg p-5 space-y-3 text-sm text-muted-foreground border border-border">
                  <p className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>All files are encrypted with AES-256-GCM. Maximum file size is 100MB.</span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <Download className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Encrypted files receive a <code className="text-xs bg-background px-1.5 py-0.5 rounded font-mono">.encrypted</code> extension and restore to their original name when decrypted.</span>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Features */}
        <div className="mt-12 space-y-5">
          <h2 className="text-2xl font-semibold text-center">Security Features</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg bg-muted/30 border border-border space-y-2.5">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h3 className="text-base font-semibold">Military-Grade Encryption</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AES-256-GCM with PBKDF2 (600,000 iterations)
              </p>
            </div>
            <div className="p-5 rounded-lg bg-muted/30 border border-border space-y-2.5">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h3 className="text-base font-semibold">Zero Data Collection</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Everything runs locally. No servers, no tracking.
              </p>
            </div>
            <div className="p-5 rounded-lg bg-muted/30 border border-border space-y-2.5">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h3 className="text-base font-semibold">Open Source</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Fully transparent and auditable code.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center space-y-6 py-16 mt-12 border-t border-border/50">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>All encryption happens locally in your browser</span>
            </div>
            <p className="text-xs text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
              We recommend using strong, unique passwords and storing them in a password manager.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <a
              href="https://github.com/blinkinfo/inkrypt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1.5 group"
            >
              <Github className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>View Source</span>
            </a>
            <span className="text-muted-foreground/40">•</span>
            <span>MIT License</span>
            <span className="text-muted-foreground/40">•</span>
            <span>Open Source</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
