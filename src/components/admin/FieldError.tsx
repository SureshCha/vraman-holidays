export function FieldError({ error }: { error?: { message?: string } }) {
  if (!error?.message) return null;
  return <p className="text-xs text-destructive">{error.message}</p>;
}
