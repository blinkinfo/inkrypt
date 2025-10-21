import { calculatePasswordStrength } from '@/lib/passwordStrength';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  show?: boolean;
}

export function PasswordStrength({ password, show = true }: PasswordStrengthProps) {
  if (!show || !password) return null;

  const strength = calculatePasswordStrength(password);

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex gap-1">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                index < strength.score
                  ? strength.score === 1
                    ? 'bg-destructive'
                    : strength.score === 2
                    ? 'bg-orange-500'
                    : strength.score === 3
                    ? 'bg-yellow-500'
                    : 'bg-success'
                  : 'bg-muted'
              )}
            />
          ))}
        </div>
        <span className={cn('text-xs font-semibold', strength.color)}>
          {strength.label}
        </span>
      </div>
      {strength.feedback.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-0.5">
          {strength.feedback.map((tip, index) => (
            <p key={index}>• {tip}</p>
          ))}
        </div>
      )}
    </div>
  );
}
