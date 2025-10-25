function getStarted() {
  window.location.href = "start.html";
}

document.getElementById("healthForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = {
    height: formData.get("height"),
    weight: formData.get("weight"),
    goal: formData.get("goal"),
    conditions: formData.get("conditions"),
  };
  const response = await fetch("/mealplan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  document.getElementById("mealplanOutput").innerText = result.mealplan || "No plan generated yet.";
});
