export function FormUnavailableMessage() {
  return (
    <section
      aria-labelledby="form-unavailable-title"
      className="rounded-md border border-border bg-surface px-8 py-12 text-center"
    >
      <h2
        id="form-unavailable-title"
        className="font-display text-xl font-semibold text-fg"
      >
        Formulário indisponível
      </h2>
      <p className="mx-auto mt-3 max-w-[42ch] text-[15px] text-muted">
        O período de inscrição para bolsas não está aberto no momento. Entre em
        contato com a secretaria da escola para mais informações.
      </p>
    </section>
  );
}
