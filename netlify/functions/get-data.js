import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("talsee");

  const fragen = await store.get("fragen", { type: "json" }).catch(() => null);
  const antworten = await store.get("antworten", { type: "json" }).catch(() => null);
  const einstellungen = await store.get("einstellungen", { type: "json" }).catch(() => null);

  const defaultFragen = [
    { id: 1, text: "Wie zufrieden sind Sie mit der Qualität unserer Produkte?", typ: "bewertung", pflicht: true },
    { id: 2, text: "Wie bewerten Sie unseren Kundenservice?", typ: "bewertung", pflicht: true },
    { id: 3, text: "Würden Sie talsee weiterempfehlen?", typ: "bewertung", pflicht: true },
    { id: 4, text: "Was hat Ihnen besonders gut gefallen oder was können wir verbessern?", typ: "freitext", pflicht: false }
  ];

  return new Response(JSON.stringify({
    fragen: fragen || defaultFragen,
    antworten: antworten || [],
    einstellungen: einstellungen || { email: "", betreff: "Neue talsee Kundenbewertung" }
  }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
};

export const config = { path: "/api/get-data" };
