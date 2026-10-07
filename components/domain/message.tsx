export function PageMessage({
  error,
  success
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      className={`mb-5 rounded-md border bg-white px-4 py-3 text-sm ${
        error ? "border-danger/30 text-danger" : "border-accent/30 text-accent"
      }`}
    >
      {error ?? success}
    </div>
  );
}
