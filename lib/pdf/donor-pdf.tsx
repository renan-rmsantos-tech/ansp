import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

// Dados do cadastro de benfeitor, já carregados do banco.
export interface DonorPdfData {
  nome: string;
  cpf: string;
  email: string;
  telefone?: string | null;
  frequencia: "unica" | "mensal";
  duracao?: "um_ano" | "indeterminado" | null;
  valor: number;
  meio_pagamento: "cartao" | "boleto" | "transferencia" | "pix";
  data_pagamento?: string | null;
  lembrete_canal?: "whatsapp" | "email" | null;
  observacoes?: string | null;
  created_at: string;
}

const FREQUENCIA_LABELS: Record<DonorPdfData["frequencia"], string> = {
  unica: "Única",
  mensal: "Mensal",
};

const DURACAO_LABELS: Record<NonNullable<DonorPdfData["duracao"]>, string> = {
  um_ano: "Por um ano",
  indeterminado: "Indeterminado",
};

const MEIO_LABELS: Record<DonorPdfData["meio_pagamento"], string> = {
  cartao: "Cartão de crédito",
  boleto: "Boleto",
  transferencia: "Transferência",
  pix: "Pix",
};

const CANAL_LABELS: Record<NonNullable<DonorPdfData["lembrete_canal"]>, string> = {
  whatsapp: "WhatsApp",
  email: "E-mail",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#1a1a1a",
  },
  header: {
    textAlign: "center",
    marginBottom: 18,
    borderBottom: "1pt solid #c9a84c",
    paddingBottom: 12,
  },
  org: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
  },
  subtitle: {
    fontSize: 9,
    color: "#555",
    marginTop: 2,
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginTop: 16,
    marginBottom: 6,
    backgroundColor: "#f0ece2",
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  twoCol: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  field: {
    width: "50%",
    flexDirection: "row",
    marginBottom: 3,
    paddingRight: 8,
  },
  fLabel: {
    color: "#555",
    marginRight: 4,
  },
  fValue: {
    fontFamily: "Helvetica-Bold",
  },
  obs: {
    marginTop: 4,
  },
});

function fmtCurrency(v?: number | null): string {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

function fmtDate(v?: string | null): string {
  if (!v) return "—";
  // 'YYYY-MM-DD' sem depender de fuso horário.
  const isoDate = v.split("T")[0];
  const [y, m, d] = isoDate.split("-");
  if (d && m && y) return `${d}/${m}/${y}`;
  const parsed = new Date(v);
  return isNaN(parsed.getTime()) ? v : parsed.toLocaleDateString("pt-BR");
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fLabel}>{label}:</Text>
      <Text style={styles.fValue}>{value ?? "—"}</Text>
    </View>
  );
}

function DonorDocument({ data }: { data: DonorPdfData }) {
  const valorLabel =
    data.frequencia === "mensal"
      ? `${fmtCurrency(data.valor)} / mês`
      : fmtCurrency(data.valor);

  return (
    <Document title={`Benfeitor - ${data.nome}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.org}>Arca Nossa Senhora da Providência</Text>
          <Text style={styles.subtitle}>Cadastro de Benfeitor</Text>
          <Text style={styles.title}>{data.nome}</Text>
        </View>

        <Text style={styles.sectionTitle}>Identificação</Text>
        <View style={styles.twoCol}>
          <Field label="Nome" value={data.nome} />
          <Field label="CPF" value={data.cpf} />
          <Field label="E-mail" value={data.email} />
          <Field label="Telefone" value={data.telefone} />
          <Field
            label="Data do cadastro"
            value={fmtDate(data.created_at)}
          />
        </View>

        <Text style={styles.sectionTitle}>Doação</Text>
        <View style={styles.twoCol}>
          <Field
            label="Frequência"
            value={FREQUENCIA_LABELS[data.frequencia]}
          />
          {data.frequencia === "mensal" && data.duracao && (
            <Field label="Duração" value={DURACAO_LABELS[data.duracao]} />
          )}
          <Field label="Valor" value={valorLabel} />
          <Field
            label="Meio de pagamento"
            value={MEIO_LABELS[data.meio_pagamento]}
          />
          <Field
            label="Data de pagamento"
            value={fmtDate(data.data_pagamento)}
          />
          {data.lembrete_canal && (
            <Field
              label="Lembrete por"
              value={CANAL_LABELS[data.lembrete_canal]}
            />
          )}
        </View>

        {data.observacoes && (
          <>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.obs}>{data.observacoes}</Text>
          </>
        )}
      </Page>
    </Document>
  );
}

export function renderDonorPdf(data: DonorPdfData): Promise<Buffer> {
  return renderToBuffer(<DonorDocument data={data} />);
}
