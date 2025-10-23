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
    <div className="space-y-2.5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              strength.score === 1
                ? 'bg-destructive w-1/4'
                : strength.score === 2
                ? 'bg-orange-500 w-2/4'
                : strength.score === 3
                ? 'bg-yellow-500 w-3/4'
                : 'bg-success w-full'
            )}
          />
        </div>
        <span className={cn('text-xs font-medium whitespace-nowrap', strength.color)}>
          {strength.label}
        </span>
      </div>
      {strength.feedback.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1 pl-0.5">
          {strength.feedback.map((tip, index) => (
            <p key={index} className="leading-relaxed">• {tip}</p>
          ))}
        </div>
      )}
    </div>
  );
}
