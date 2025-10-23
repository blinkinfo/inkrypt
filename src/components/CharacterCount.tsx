interface CharacterCountProps {
  text: string;
  show: boolean;
}

export function CharacterCount({ text, show }: CharacterCountProps) {
  if (!show) return null;

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="text-xs text-muted-foreground">
      {charCount} character{charCount !== 1 ? 's' : ''}
      {charCount > 0 && (
        <>
          {' • '}
          {wordCount} word{wordCount !== 1 ? 's' : ''}
        </>
      )}
    </div>
  );
}
