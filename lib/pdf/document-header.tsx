import { Image, Text, View, StyleSheet } from "@react-pdf/renderer";
import { SEAL_DATA_URI } from "./seal-image";

// Cabeçalho institucional compartilhado pelos PDFs (Decisão e Contrato).
export interface DocumentHeaderData {
  linha1: string;
  linha2: string;
  linha3: string;
  mostrar_selo: boolean;
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
    width: 68,
    height: 68,
    marginBottom: 8,
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
