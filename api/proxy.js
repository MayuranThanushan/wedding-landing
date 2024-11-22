export default async function handler(req, res) {
  console.log("Received request:", req.body);

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

      if (!response.ok) {
        console.error("Google Apps Script request failed:", response.status);
        return res.status(500).json({ error: "Failed to send data to Google Apps Script" });
      }

      const data = await response.json();
      console.log("Google Apps Script response:", data);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error in proxy function:", error);
      res.status(500).json({ error: "Failed to forward the request" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}