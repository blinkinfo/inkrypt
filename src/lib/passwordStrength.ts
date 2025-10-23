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

  // Length check (0-2 points)
  if (password.length >= 16) {
    score += 2;
  } else if (password.length >= 12) {
    score += 2;
  } else if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use at least 8 characters');
  }

  // Character variety checks (0-3 points)
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

  if (hasLowercase && hasUppercase) {
    score++;
  } else {
    feedback.push('Use both uppercase and lowercase letters');
  }

  if (hasNumbers) {
    score++;
  } else {
    feedback.push('Add numbers');
  }

  if (hasSpecialChars) {
    score++;
  } else {
    feedback.push('Add special characters (!@#$%^&*)');
  }

  // Common patterns (penalty)
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

  // Cap score at 4
  score = Math.min(4, score);

  let label = '';
  let color = '';

  switch (score) {
    case 0:
      label = 'Very Weak';
      color = 'text-destructive';
      break;
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
