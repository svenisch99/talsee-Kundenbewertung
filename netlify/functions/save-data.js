import { getStore } from "@netlify/blobs";

const ADMIN_PASSWORD = "talsee2024"; // Wird beim ersten Speichern durch Einstellungen überschrieben

export default async (req, context) => {
  if (req.method === "OPTIONS") {
    return new Response("", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { type, data, password } = body;
  const store = getStore("talsee");

  // Passwort prüfen für Admin-Aktionen
  if (type === "fragen" || type === "einstellungen") {
    const einstellungen = await store.get("einstellungen", { type: "json" }).catch(() => null);
    const currentPassword = einstellungen?.adminPassword || ADMIN_PASSWORD;
    if (password !== currentPassword) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
  }

  try {
    if (type === "fragen") {
      await store.setJSON("fragen", data);
    } else if (type === "antwort") {
      // Neue Antwort anhängen
      const existing = await store.get("antworten", { type: "json" }).catch(() => []);
      const antworten = existing || [];
      antworten.push({ ...data, timestamp: new Date().toISOString() });
      await store.setJSON("antworten", antworten);
    } else if (type === "einstellungen") {
      await store.setJSON("einstellungen", data);
    } else {
      return new Response(JSON.stringify({ error: "Unknown type" }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};

export const config = { path: "/api/save-data" };
