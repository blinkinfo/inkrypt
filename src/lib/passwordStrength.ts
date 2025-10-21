export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  feedback: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'No password',
      color: 'text-muted-foreground',
      feedback: ['Enter a password to see strength'],
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  else if (password.length < 8) {
    feedback.push('Use at least 8 characters');
  }

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Use both uppercase and lowercase letters');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Add numbers');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Add special characters (!@#$%^&*)');
  }

  // Common patterns (reduce score)
  const commonPatterns = [
    /^123/,
    /password/i,
    /qwerty/i,
    /abc/i,
    /111/,
    /000/,
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns');
  }

  // Normalize score to 0-4
  score = Math.min(4, Math.max(0, Math.floor(score / 1.5)));

  let label = '';
  let color = '';

  switch (score) {
    case 0:
    case 1:
      label = 'Weak';
      color = 'text-destructive';
      break;
    case 2:
      label = 'Fair';
      color = 'text-orange-500';
      break;
    case 3:
      label = 'Good';
      color = 'text-yellow-500';
      break;
    case 4:
      label = 'Strong';
      color = 'text-success';
      break;
  }

  return { score, label, color, feedback };
}
