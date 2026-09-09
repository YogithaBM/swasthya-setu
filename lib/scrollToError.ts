/**
 * Scroll the first visible validation error into view and focus it.
 * Called from form submit handlers AFTER error state is committed, so the
 * error elements ([role="alert"] inline messages / error toasts) exist in
 * the DOM by the time this runs.
 */
export function scrollToFirstError(): void {
  if (typeof document === "undefined") return;
  const firstError = document.querySelector<HTMLElement>(
    '[role="alert"], .error-message, .field-error'
  );
  if (!firstError) return;

  firstError.scrollIntoView({ behavior: "smooth", block: "center" });

  // Focus the field the error belongs to (fall back to the message itself).
  const field =
    firstError
      .closest("label")
      ?.querySelector<HTMLElement>("input, select, textarea") ??
    firstError.querySelector<HTMLElement>("input, select, textarea") ??
    firstError;
  field.focus({ preventScroll: true });
}
