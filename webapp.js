const webhookUrl = "/api/proxy"; // Vercel API route to proxy the request

  document.getElementById("rsvpForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = {
      response: document.querySelector('input[name="response"]:checked')?.value,
      fullname: document.getElementById("fullname").value,
      emailaddress: document.getElementById("emailaddress").value,
      contactnumber: document.getElementById("contactnumber").value,
      guests: document.getElementById("guests").value,
      vegPreference: document.getElementById("vegPreference").value,
      nonvegPreference: document.getElementById("nonvegPreference").value,
      message: document.getElementById("message").value,
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      alert(result.status === "success" ? "Form submitted!" : "Submission failed.");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    }
  });