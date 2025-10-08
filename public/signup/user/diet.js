document.addEventListener("DOMContentLoaded", () => {
  const askButton = document.getElementById("askButton");

  askButton.addEventListener("click", async () => {
    const mealRequest = document.getElementById("mealRequest").value;

    const userProfile = {
      age: 25,
      gender: "female",
      height: 165,
      weight: 60,
      allergies: "nuts",
      goal: "weight loss",
      healthIssue: "none",
      mealRequest
    };

    try {
      const res = await fetch("http://localhost:3000/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});


      const data = await res.json();
      document.getElementById("response").innerText = data.reply;
    } catch (err) {
      console.error(err);
      document.getElementById("response").innerText = "⚠️ Could not fetch meal plan.";
    }
  });
});
