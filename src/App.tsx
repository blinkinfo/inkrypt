import { useState } from 'react';
import { Lock, Unlock, Copy, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { encrypt, decrypt } from '@/lib/crypto';

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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="encrypt" data-state={activeTab === 'encrypt' ? 'active' : 'inactive'}>
                  <Lock className="w-4 h-4 mr-2" />
                  Encrypt
                </TabsTrigger>
                <TabsTrigger value="decrypt" data-state={activeTab === 'decrypt' ? 'active' : 'inactive'}>
                  <Unlock className="w-4 h-4 mr-2" />
                  Decrypt
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
