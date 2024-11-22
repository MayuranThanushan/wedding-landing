const webhookUrl = "/api/proxy";

  document.getElementById("rsvpForm").addEventListener("submit", async (e) => {
    e.preventDefault();

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
    } catch (error) {
      console.error("Error:", error);
    }
  });