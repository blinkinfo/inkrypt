import { useState, useRef } from 'react';
import { Lock, Unlock, Copy, Eye, EyeOff, ShieldCheck, FileUp, Download, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { encrypt, decrypt, encryptFile, decryptFile, formatFileSize } from '@/lib/crypto';
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('encrypt');

  const handleEncrypt = async () => {
    setError('');
    setSuccess('');
    setEncryptedResult('');

    if (!plaintext.trim()) {
      setError('Please enter text to encrypt');
      return;
    }

    if (!encryptPassword) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);
    try {
      const result = await encrypt(plaintext, encryptPassword);
      setEncryptedResult(result);
      setSuccess('Text encrypted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    setError('');
    setSuccess('');
    setDecryptedResult('');

    if (!ciphertext.trim()) {
      setError('Please enter text to decrypt');
      return;
    }

    if (!decryptPassword) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);
    try {
      const result = await decrypt(ciphertext, decryptPassword);
      setDecryptedResult(result);
      setSuccess('Text decrypted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const clearEncryptForm = () => {
    setPlaintext('');
    setEncryptPassword('');
    setEncryptedResult('');
    setError('');
    setSuccess('');
  };

  const clearDecryptForm = () => {
    setCiphertext('');
    setDecryptPassword('');
    setDecryptedResult('');
    setError('');
    setSuccess('');
  };

  // File encryption handlers
  const handleFileEncryptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileSize(file, 100)) {
      setError('File size must be less than 100MB');
      return;
    }

    setFileToEncrypt(file);
    setError('');
  };

  const handleFileEncrypt = async () => {
    setError('');
    setSuccess('');

    if (!fileToEncrypt) {
      setError('Please select a file to encrypt');
      return;
    }

    if (!fileEncryptPassword) {
      setError('Please enter a password');
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

      setSuccess(`File encrypted successfully! Download started: ${encryptedFileName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFileEncryptForm = () => {
    setFileToEncrypt(null);
    setFileEncryptPassword('');
    if (fileEncryptInputRef.current) {
      fileEncryptInputRef.current.value = '';
    }
    setError('');
    setSuccess('');
  };

  // File decryption handlers
  const handleFileDecryptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileSize(file, 100)) {
      setError('File size must be less than 100MB');
      return;
    }

    setFileToDecrypt(file);
    setError('');
  };

  const handleFileDecrypt = async () => {
    setError('');
    setSuccess('');

    if (!fileToDecrypt) {
      setError('Please select a file to decrypt');
      return;
    }

    if (!fileDecryptPassword) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);
    try {
      const fileData = await readFileAsArrayBuffer(fileToDecrypt);
      const { data, fileName } = await decryptFile(fileData, fileDecryptPassword);

      // Download decrypted file with original name
      const decryptedFileName = sanitizeFileName(fileName);
      downloadFile(data, decryptedFileName);

      setSuccess(`File decrypted successfully! Download started: ${decryptedFileName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File decryption failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFileDecryptForm = () => {
    setFileToDecrypt(null);
    setFileDecryptPassword('');
    if (fileDecryptInputRef.current) {
      fileDecryptInputRef.current.value = '';
    }
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              inkrypt
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Secure, client-side encryption and decryption
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="animate-in slide-in-from-top-2 border-green-500 text-green-700 dark:text-green-400">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Encryption Tool
            </CardTitle>
            <CardDescription>
              All encryption happens locally in your browser. Your data never leaves your device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="encrypt" data-state={activeTab === 'encrypt' ? 'active' : 'inactive'}>
                  <Lock className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Text </span>Encrypt
                </TabsTrigger>
                <TabsTrigger value="decrypt" data-state={activeTab === 'decrypt' ? 'active' : 'inactive'}>
                  <Unlock className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Text </span>Decrypt
                </TabsTrigger>
                <TabsTrigger value="file" data-state={activeTab === 'file' ? 'active' : 'inactive'}>
                  <File className="w-4 h-4 mr-1 md:mr-2" />
                  File
                </TabsTrigger>
              </TabsList>

              {/* Encrypt Tab */}
              <TabsContent value="encrypt" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plaintext">Text to Encrypt</Label>
                  <Textarea
                    id="plaintext"
                    placeholder="Enter your secret message..."
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encrypt-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="encrypt-password"
                      type={showEncryptPassword ? 'text' : 'password'}
                      placeholder="Enter a strong password..."
                      value={encryptPassword}
                      onChange={(e) => setEncryptPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEncrypt()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEncryptPassword(!showEncryptPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showEncryptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleEncrypt} disabled={loading} className="flex-1">
                    <Lock className="w-4 h-4 mr-2" />
                    {loading ? 'Encrypting...' : 'Encrypt'}
                  </Button>
                  <Button onClick={clearEncryptForm} variant="outline" disabled={loading}>
                    Clear
                  </Button>
                </div>

                {encryptedResult && (
                  <div className="space-y-2 animate-in slide-in-from-bottom-2">
                    <Label htmlFor="encrypted-result">Encrypted Result</Label>
                    <div className="relative">
                      <Textarea
                        id="encrypted-result"
                        value={encryptedResult}
                        readOnly
                        className="min-h-[120px] resize-none font-mono text-xs bg-muted"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(encryptedResult)}
                        className="absolute right-2 top-2"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Decrypt Tab */}
              <TabsContent value="decrypt" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ciphertext">Encrypted Text</Label>
                  <Textarea
                    id="ciphertext"
                    placeholder="Paste your encrypted text here..."
                    value={ciphertext}
                    onChange={(e) => setCiphertext(e.target.value)}
                    className="min-h-[120px] resize-none font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decrypt-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="decrypt-password"
                      type={showDecryptPassword ? 'text' : 'password'}
                      placeholder="Enter your password..."
                      value={decryptPassword}
                      onChange={(e) => setDecryptPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDecrypt()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDecryptPassword(!showDecryptPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showDecryptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleDecrypt} disabled={loading} className="flex-1">
                    <Unlock className="w-4 h-4 mr-2" />
                    {loading ? 'Decrypting...' : 'Decrypt'}
                  </Button>
                  <Button onClick={clearDecryptForm} variant="outline" disabled={loading}>
                    Clear
                  </Button>
                </div>

                {decryptedResult && (
                  <div className="space-y-2 animate-in slide-in-from-bottom-2">
                    <Label htmlFor="decrypted-result">Decrypted Result</Label>
                    <div className="relative">
                      <Textarea
                        id="decrypted-result"
                        value={decryptedResult}
                        readOnly
                        className="min-h-[120px] resize-none bg-muted"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(decryptedResult)}
                        className="absolute right-2 top-2"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* File Tab */}
              <TabsContent value="file" className="space-y-6">
                {/* File Encryption Section */}
                <div className="space-y-4 pb-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Encrypt File</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-encrypt-input">Select File to Encrypt</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="file-encrypt-input"
                        ref={fileEncryptInputRef}
                        type="file"
                        onChange={handleFileEncryptSelect}
                        className="cursor-pointer"
                        disabled={loading}
                      />
                    </div>
                    {fileToEncrypt && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <FileUp className="w-4 h-4" />
                        {fileToEncrypt.name} ({formatFileSize(fileToEncrypt.size)})
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-encrypt-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="file-encrypt-password"
                        type={showFileEncryptPassword ? 'text' : 'password'}
                        placeholder="Enter a strong password..."
                        value={fileEncryptPassword}
                        onChange={(e) => setFileEncryptPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowFileEncryptPassword(!showFileEncryptPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showFileEncryptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleFileEncrypt} disabled={loading || !fileToEncrypt} className="flex-1">
                      <Lock className="w-4 h-4 mr-2" />
                      {loading ? 'Encrypting...' : 'Encrypt & Download'}
                    </Button>
                    <Button onClick={clearFileEncryptForm} variant="outline" disabled={loading}>
                      Clear
                    </Button>
                  </div>
                </div>

                {/* File Decryption Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Unlock className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Decrypt File</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-decrypt-input">Select Encrypted File</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="file-decrypt-input"
                        ref={fileDecryptInputRef}
                        type="file"
                        onChange={handleFileDecryptSelect}
                        className="cursor-pointer"
                        disabled={loading}
                      />
                    </div>
                    {fileToDecrypt && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <FileUp className="w-4 h-4" />
                        {fileToDecrypt.name} ({formatFileSize(fileToDecrypt.size)})
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-decrypt-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="file-decrypt-password"
                        type={showFileDecryptPassword ? 'text' : 'password'}
                        placeholder="Enter your password..."
                        value={fileDecryptPassword}
                        onChange={(e) => setFileDecryptPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowFileDecryptPassword(!showFileDecryptPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showFileDecryptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleFileDecrypt} disabled={loading || !fileToDecrypt} className="flex-1">
                      <Unlock className="w-4 h-4 mr-2" />
                      {loading ? 'Decrypting...' : 'Decrypt & Download'}
                    </Button>
                    <Button onClick={clearFileDecryptForm} variant="outline" disabled={loading}>
                      Clear
                    </Button>
                  </div>
                </div>

                {/* File Info */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <Download className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Encrypted files will be downloaded with a <code className="text-xs bg-background px-1 py-0.5 rounded">.encrypted</code> extension.
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <Download className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Decrypted files will be restored to their original name and format.
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <span>
                      Maximum file size: 100MB. All file types are supported.
                    </span>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>
                  <strong className="text-foreground">Military-grade encryption:</strong> Uses AES-256-GCM with PBKDF2 key derivation (600,000 iterations)
                </span>
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>
                  <strong className="text-foreground">Zero data collection:</strong> All operations run in your browser. Nothing is sent to any server.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>
                  <strong className="text-foreground">Open source:</strong> Fully transparent and auditable code.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pb-4">
          <p>Made with security in mind. Remember to use strong, unique passwords.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
