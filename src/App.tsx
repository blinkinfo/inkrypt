import { useState, useRef } from 'react';
import { Lock, Unlock, Copy, Eye, EyeOff, ShieldCheck, Download, File, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
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
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-8">
        {/* Header */}
        <header className="text-center space-y-3 pt-4 sm:pt-8 pb-4">
          <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-sm animate-fade-in">
            <div className="relative">
              <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              <Sparkles className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent tracking-tight">
              inkrypt
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Military-grade encryption right in your browser. Zero servers, zero tracking.
          </p>
        </header>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="animate-slide-in shadow-lg border-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="animate-slide-in bg-success/10 border-2 border-success/50 text-success-foreground shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="font-medium text-success">{success}</AlertDescription>
          </Alert>
        )}

        {/* Main Card */}
        <Card className="shadow-xl border-2 overflow-hidden backdrop-blur-sm">
          <CardHeader className="border-b bg-muted/30 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  Encryption Tool
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  All encryption happens locally. Your data never leaves your device.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b bg-muted/20">
                <TabsList className="grid w-full grid-cols-3 h-auto p-0 bg-transparent rounded-none gap-0">
                  <TabsTrigger
                    value="encrypt"
                    data-state={activeTab === 'encrypt' ? 'active' : 'inactive'}
                    className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-sm py-3 sm:py-4 text-xs sm:text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary"
                  >
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">Text </span>Encrypt
                  </TabsTrigger>
                  <TabsTrigger
                    value="decrypt"
                    data-state={activeTab === 'decrypt' ? 'active' : 'inactive'}
                    className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-sm py-3 sm:py-4 text-xs sm:text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary border-x"
                  >
                    <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">Text </span>Decrypt
                  </TabsTrigger>
                  <TabsTrigger
                    value="file"
                    data-state={activeTab === 'file' ? 'active' : 'inactive'}
                    className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-sm py-3 sm:py-4 text-xs sm:text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary"
                  >
                    <File className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    File
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Encrypt Tab */}
              <TabsContent value="encrypt" className="space-y-5 p-4 sm:p-6 m-0">
                <div className="space-y-2.5">
                  <Label htmlFor="plaintext" className="text-sm font-semibold">Text to Encrypt</Label>
                  <Textarea
                    id="plaintext"
                    placeholder="Enter your secret message here..."
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                    className="min-h-[140px] sm:min-h-[160px] resize-none text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="encrypt-password" className="text-sm font-semibold">Password</Label>
                  <div className="relative">
                    <Input
                      id="encrypt-password"
                      type={showEncryptPassword ? 'text' : 'password'}
                      placeholder="Enter a strong password..."
                      value={encryptPassword}
                      onChange={(e) => setEncryptPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEncrypt()}
                      className="pr-10 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEncryptPassword(!showEncryptPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                    >
                      {showEncryptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button onClick={handleEncrypt} disabled={loading} className="flex-1 h-11 font-semibold shadow-md hover:shadow-lg transition-all">
                    <Lock className="w-4 h-4 mr-2" />
                    {loading ? 'Encrypting...' : 'Encrypt Text'}
                  </Button>
                  <Button onClick={clearEncryptForm} variant="outline" disabled={loading} className="h-11 px-6">
                    Clear
                  </Button>
                </div>

                {encryptedResult && (
                  <div className="space-y-2.5 animate-slide-in pt-2">
                    <Label htmlFor="encrypted-result" className="text-sm font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Encrypted Result
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="encrypted-result"
                        value={encryptedResult}
                        readOnly
                        className="min-h-[140px] sm:min-h-[160px] resize-none font-mono text-xs bg-muted/50 border-2 border-success/20"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(encryptedResult)}
                        className="absolute right-2 top-2 shadow-sm"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Decrypt Tab */}
              <TabsContent value="decrypt" className="space-y-5 p-4 sm:p-6 m-0">
                <div className="space-y-2.5">
                  <Label htmlFor="ciphertext" className="text-sm font-semibold">Encrypted Text</Label>
                  <Textarea
                    id="ciphertext"
                    placeholder="Paste your encrypted text here..."
                    value={ciphertext}
                    onChange={(e) => setCiphertext(e.target.value)}
                    className="min-h-[140px] sm:min-h-[160px] resize-none font-mono text-xs focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="decrypt-password" className="text-sm font-semibold">Password</Label>
                  <div className="relative">
                    <Input
                      id="decrypt-password"
                      type={showDecryptPassword ? 'text' : 'password'}
                      placeholder="Enter your password..."
                      value={decryptPassword}
                      onChange={(e) => setDecryptPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDecrypt()}
                      className="pr-10 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDecryptPassword(!showDecryptPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                    >
                      {showDecryptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button onClick={handleDecrypt} disabled={loading} className="flex-1 h-11 font-semibold shadow-md hover:shadow-lg transition-all">
                    <Unlock className="w-4 h-4 mr-2" />
                    {loading ? 'Decrypting...' : 'Decrypt Text'}
                  </Button>
                  <Button onClick={clearDecryptForm} variant="outline" disabled={loading} className="h-11 px-6">
                    Clear
                  </Button>
                </div>

                {decryptedResult && (
                  <div className="space-y-2.5 animate-slide-in pt-2">
                    <Label htmlFor="decrypted-result" className="text-sm font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Decrypted Result
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="decrypted-result"
                        value={decryptedResult}
                        readOnly
                        className="min-h-[140px] sm:min-h-[160px] resize-none bg-muted/50 border-2 border-success/20"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(decryptedResult)}
                        className="absolute right-2 top-2 shadow-sm"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* File Tab */}
              <TabsContent value="file" className="space-y-6 p-4 sm:p-6 m-0">
                {/* File Encryption Section */}
                <div className="space-y-4 pb-6 border-b">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold">Encrypt File</h3>
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="file-encrypt-input" className="text-sm font-semibold">Select File to Encrypt</Label>
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

                  <div className="space-y-2.5">
                    <Label htmlFor="file-encrypt-password" className="text-sm font-semibold">Password</Label>
                    <div className="relative">
                      <Input
                        id="file-encrypt-password"
                        type={showFileEncryptPassword ? 'text' : 'password'}
                        placeholder="Enter a strong password..."
                        value={fileEncryptPassword}
                        onChange={(e) => setFileEncryptPassword(e.target.value)}
                        disabled={loading}
                        className="pr-10 focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFileEncryptPassword(!showFileEncryptPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                      >
                        {showFileEncryptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <Button onClick={handleFileEncrypt} disabled={loading || !fileToEncrypt} className="flex-1 h-11 font-semibold shadow-md hover:shadow-lg transition-all">
                      <Lock className="w-4 h-4 mr-2" />
                      {loading ? 'Encrypting...' : 'Encrypt & Download'}
                    </Button>
                    <Button onClick={clearFileEncryptForm} variant="outline" disabled={loading} className="h-11 px-6">
                      Clear
                    </Button>
                  </div>
                </div>

                {/* File Decryption Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Unlock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold">Decrypt File</h3>
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="file-decrypt-input" className="text-sm font-semibold">Select Encrypted File</Label>
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

                  <div className="space-y-2.5">
                    <Label htmlFor="file-decrypt-password" className="text-sm font-semibold">Password</Label>
                    <div className="relative">
                      <Input
                        id="file-decrypt-password"
                        type={showFileDecryptPassword ? 'text' : 'password'}
                        placeholder="Enter your password..."
                        value={fileDecryptPassword}
                        onChange={(e) => setFileDecryptPassword(e.target.value)}
                        disabled={loading}
                        className="pr-10 focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFileDecryptPassword(!showFileDecryptPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                      >
                        {showFileDecryptPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <Button onClick={handleFileDecrypt} disabled={loading || !fileToDecrypt} className="flex-1 h-11 font-semibold shadow-md hover:shadow-lg transition-all">
                      <Unlock className="w-4 h-4 mr-2" />
                      {loading ? 'Decrypting...' : 'Decrypt & Download'}
                    </Button>
                    <Button onClick={clearFileDecryptForm} variant="outline" disabled={loading} className="h-11 px-6">
                      Clear
                    </Button>
                  </div>
                </div>

                {/* File Info */}
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 sm:p-5 space-y-2.5 border border-primary/20">
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2.5">
                    <div className="p-1 rounded-md bg-background/80">
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                    </div>
                    <span>
                      Encrypted files download with a <code className="text-xs bg-background px-1.5 py-0.5 rounded font-semibold">.encrypted</code> extension.
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2.5">
                    <div className="p-1 rounded-md bg-background/80">
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                    </div>
                    <span>
                      Decrypted files restore to original name and format automatically.
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2.5">
                    <div className="p-1 rounded-md bg-background/80">
                      <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                    </div>
                    <span>
                      <strong className="text-foreground">100MB max</strong> file size. All file types supported.
                    </span>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="border-2 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b p-4 sm:p-5">
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Security Features
            </h3>
          </div>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-3 sm:gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-muted">
                <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Military-Grade Encryption</p>
                  <p className="text-xs text-muted-foreground">
                    AES-256-GCM with PBKDF2 key derivation (600,000 iterations)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-muted">
                <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Zero Data Collection</p>
                  <p className="text-xs text-muted-foreground">
                    Everything runs locally in your browser. No servers, no tracking.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-muted">
                <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Open Source & Auditable</p>
                  <p className="text-xs text-muted-foreground">
                    Fully transparent code. Verify the security yourself.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center space-y-2 py-6 mt-4">
          <p className="text-xs text-muted-foreground">
            Made with security in mind. Always use strong, unique passwords.
          </p>
          <p className="text-xs text-muted-foreground/60">
            © 2024 inkrypt • Open Source • MIT License
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
