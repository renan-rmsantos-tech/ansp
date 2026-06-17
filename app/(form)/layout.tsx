import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solicitação de Bolsa — Arca N. S. da Providência",
  description:
    "Formulário de solicitação de bolsa para família necessitada — Ano Letivo 2026",
};

export default function FormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[720px] px-4 py-8 pb-16 max-sm:px-3 max-sm:py-5">
        <header className="mb-10 text-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 220 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-3"
            role="img"
            aria-label="Logo Arca N. S. da Providência"
          >
            <defs>
              <clipPath id="form-clip">
                <circle cx="110" cy="110" r="84" />
              </clipPath>
              <radialGradient id="form-bg" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#1e2a4a" />
                <stop offset="100%" stopColor="#0f1729" />
              </radialGradient>
            </defs>
            <circle
              cx="110"
              cy="110"
              r="106"
              fill="url(#form-bg)"
              stroke="#c9a84c"
              strokeWidth="3"
            />
            <circle
              cx="110"
              cy="110"
              r="98"
              fill="none"
              stroke="#c9a84c"
              strokeWidth="0.6"
              opacity="0.35"
            />
            <image
              href="/base1.png"
              x="22"
              y="30"
              width="176"
              height="184"
              clipPath="url(#form-clip)"
              preserveAspectRatio="xMidYMid slice"
            />
            <circle
              cx="110"
              cy="110"
              r="84"
              fill="none"
              stroke="#0f1729"
              strokeWidth="12"
              opacity="0.2"
            />
            <path
              id="form-top"
              d="M 18,110 a 92,92 0 0,1 184,0"
              fill="none"
            />
            <text
              fill="#c9a84c"
              fontFamily="'Iowan Old Style','Charter','Palatino',Georgia,serif"
              fontSize="12.5"
              fontWeight="700"
              letterSpacing="0.18em"
            >
              <textPath href="#form-top" startOffset="50%" textAnchor="middle">
                ARCA
              </textPath>
            </text>
            <path
              id="form-bot"
              d="M 20,118 a 90,90 0 0,0 180,0"
              fill="none"
            />
            <text
              fill="#c9a84c"
              fontFamily="'Iowan Old Style','Charter','Palatino',Georgia,serif"
              fontSize="11"
              fontWeight="700"
              letterSpacing="0.14em"
            >
              <textPath href="#form-bot" startOffset="50%" textAnchor="middle">
                N. S. DA PROVIDÊNCIA
              </textPath>
            </text>
          </svg>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-muted">
            Arca N. S. da Providência
          </p>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-fg max-sm:text-[22px]">
            Solicitação de Bolsa
          </h1>
          <p className="mx-auto mt-2 max-w-[50ch] text-[15px] text-muted">
            Consulte a disponibilidade do período de inscrições e preencha os
            dados solicitados quando o formulário estiver aberto.
          </p>
        </header>
        {children}
      </div>
    </div>
  );
}
