/** Primera letra en mayúscula (resto sin cambiar). Para títulos y encabezados. */
export function capitalizeHeading(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
