const API_KEY = "f5045040872e4ca19a52b20c66bb614a"; // replace with your key
let userProfile = null;

document.getElementById("user-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  userProfile = {
    age: formData.get("age"),
    gender: formData.get("gender"),
    height: formData.get("height"),
    weight: formData.get("weight"),
    allergies: formData.get("allergies"),
    fitnessGoal: formData.get("goal"),
    healthIssues: formData.get("healthIssue"),
  };
  alert("Profile saved!");
  document.getElementById("chat-section").style.display = "block";
});

document.getElementById("ask-btn").addEventListener("click", async () => {
  if (!userProfile) {
    alert("Please fill your profile first.");
    return;
  }

  const mealType = document.getElementById("meal-request").value || "breakfast";
  const recDiv = document.getElementById("recommendations");
  recDiv.innerHTML = "⏳ Fetching your personalized diet plan...";

  try {
    const targetUrl = `https://api.spoonacular.com/mealplanner/generate?timeFrame=day&apiKey=${API_KEY}`;
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);

    if (!response.ok) throw new Error("API fetch failed");

    const data = await response.json();
    console.log("✅ API Data:", data);

    if (!data.meals || data.meals.length === 0) {
      recDiv.innerHTML = "⚠️ No meals found. Try again.";
      return;
    }

    // Pick a meal matching the user’s requested type (or default to first)
    let selectedMeal =
      data.meals.find((m) =>
        m.title.toLowerCase().includes(mealType.toLowerCase())
      ) || data.meals[0];

    // Fetch meal details to get image + ingredients
    const detailsUrl = `https://api.spoonacular.com/recipes/${selectedMeal.id}/information?apiKey=${API_KEY}`;
    const detailsRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(detailsUrl)}`);
    const mealDetails = await detailsRes.json();

    console.log("🍽️ Meal Details:", mealDetails);

    recDiv.innerHTML = `
      <h3>${selectedMeal.title}</h3>
      <p><strong>Ready in:</strong> ${selectedMeal.readyInMinutes} minutes</p>
      <p><strong>Servings:</strong> ${selectedMeal.servings}</p>
      <a href="${selectedMeal.sourceUrl}" target="_blank">🔗 View Full Recipe</a>
      <br><br>
      <img src="${mealDetails.image}" alt="${selectedMeal.title}" style="max-width:100%;border-radius:12px;margin-top:12px;">
      <p><strong>Calories:</strong> ${Math.round(data.nutrients.calories)} kcal</p>
    `;
  } catch (err) {
    console.error(err);
    recDiv.innerHTML = "❌ Unable to fetch diet plan. Please try again later.";
  }
});
