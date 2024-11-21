export default async function handler(req, res) {
  if (req.method === "POST") {
    const googleAppsScriptUrl = "https://script.google.com/macros/s/AKfycbxB8qESkQfWIT-RgWCdl-PSZlEMF_J4Sx9nYMRMHFsRzMC3e_gE9S7svhRfrN_LI6l8/exec";

    try {
      const response = await fetch(googleAppsScriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to forward the request" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
