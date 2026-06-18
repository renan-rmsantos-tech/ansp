import { Image, Text, View, StyleSheet } from "@react-pdf/renderer";
import { SEAL_DATA_URI } from "./seal-image";

// Cabeçalho institucional compartilhado pelos PDFs (Decisão e Contrato).
export interface DocumentHeaderData {
  linha1: string;
  linha2: string;
  linha3: string;
  mostrar_selo: boolean;
}

// Cabeçalho padrão quando ainda não há configuração salva em document_header.
export const DEFAULT_DOCUMENT_HEADER: DocumentHeaderData = {
  linha1: "Arca Nossa Senhora da Providência",
  linha2: "",
  linha3: "",
  mostrar_selo: true,
};

// Aplica o cabeçalho padrão sobre uma configuração parcial/ausente, garantindo
// que todos os PDFs sempre exibam o cabeçalho institucional.
export function resolveDocumentHeader(
  header: Partial<DocumentHeaderData> | null | undefined
): DocumentHeaderData {
  return {
    linha1: header?.linha1?.trim()
      ? header.linha1
      : DEFAULT_DOCUMENT_HEADER.linha1,
    linha2: header?.linha2 ?? DEFAULT_DOCUMENT_HEADER.linha2,
    linha3: header?.linha3 ?? DEFAULT_DOCUMENT_HEADER.linha3,
    mostrar_selo: header?.mostrar_selo ?? DEFAULT_DOCUMENT_HEADER.mostrar_selo,
  };
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 22,
    paddingBottom: 14,
    borderBottom: "1pt solid #c9a84c",
  },
  selo: {
    width: 92,
    height: 92,
    marginBottom: 10,
  },
  linha1: {
    fontFamily: "Times-Bold",
    fontSize: 14,
  },
  linha2: {
    fontSize: 10,
    color: "#444",
    marginTop: 2,
  },
  linha3: {
    fontSize: 10,
    color: "#444",
    marginTop: 1,
  },
});

export function DocumentHeaderView({ header }: { header: DocumentHeaderData }) {
  return (
    <View style={styles.wrap}>
      {/* react-pdf Image não suporta alt — regra de HTML não se aplica */}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {header.mostrar_selo && <Image src={SEAL_DATA_URI} style={styles.selo} />}
      {header.linha1.trim() !== "" && (
        <Text style={styles.linha1}>{header.linha1}</Text>
      )}
      {header.linha2.trim() !== "" && (
        <Text style={styles.linha2}>{header.linha2}</Text>
      )}
      {header.linha3.trim() !== "" && (
        <Text style={styles.linha3}>{header.linha3}</Text>
      )}
    </View>
  );
}
