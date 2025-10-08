document.addEventListener('DOMContentLoaded', function () {
    let foodItems = [];
      let totalGlasses = 8;
let currentGlasses = 0;
    const maxWater = 2000; 
    const waterEl = document.getElementById('water');
const statsEl = document.getElementById('stats');
const messageEl = document.getElementById('message');
const goalInput = document.getElementById('goalInput');
    const caloriesChart = new Chart(
        document.getElementById('calories-chart'),
        {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Calories Consumed',
                    data: [1800, 2100, 1900, 2200, 2000, 2300, 2100],
                    borderColor: '#3498db',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        }
    );

    const macrosChart = new Chart(
        document.getElementById('macros-chart'),
        {
            type: 'pie',
            data: {
                labels: ['Protein', 'Carbs', 'Fat'],
                datasets: [{
                    data: [30, 50, 20],
                    backgroundColor: [
                        '#3498db',
                        '#2ecc71',
                        '#e74c3c'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );

    function generateCalendar() {
        const calendarEl = document.getElementById('calendar');
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day');
            calendarEl.appendChild(emptyDay);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('calendar-day');
            dayEl.textContent = i;
            if (i === today.getDate()) {
                dayEl.classList.add('active');
            } else if (i < today.getDate() && Math.random() > 0.3) {
                dayEl.classList.add('active');
            }

            calendarEl.appendChild(dayEl);
        }
    }
    document.getElementById('add-food').addEventListener('click', addFoodItem);
    document.getElementById('food-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addFoodItem();
        }
    });

    function addFoodItem() {
        const foodInput = document.getElementById('food-input');
        const foodName = foodInput.value.trim();

        if (foodName) {
            const calories = Math.floor(Math.random() * 300) + 100;
            const protein = (Math.random() * 20).toFixed(1);
            const fat = (Math.random() * 15).toFixed(1);
            const fiber = (Math.random() * 10).toFixed(1);

            const foodItem = {
                name: foodName,
                calories: calories,
                protein: protein,
                fat: fat,
                fiber: fiber
            };

            foodItems.push(foodItem);
            renderFoodItems();
            updateNutritionSummary();
            foodInput.value = '';
            foodInput.focus();
        }
    }

    function renderFoodItems() {
        const foodListEl = document.getElementById('food-list');
        foodListEl.innerHTML = '';

        foodItems.forEach(item => {
            const foodItemEl = document.createElement('div');
            foodItemEl.classList.add('food-item');

            foodItemEl.innerHTML = `
                <div class="food-name">${item.name}</div>
                <div class="food-nutrition">
                    ${item.calories} cal | P: ${item.protein}g | F: ${item.fat}g | Fib: ${item.fiber}g
                </div>
            `;

            foodListEl.appendChild(foodItemEl);
        });
    }

    function updateNutritionSummary() {
        const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);
        const totalProtein = foodItems.reduce((sum, item) => sum + parseFloat(item.protein), 0).toFixed(1);
        const totalFat = foodItems.reduce((sum, item) => sum + parseFloat(item.fat), 0).toFixed(1);
        const totalFiber = foodItems.reduce((sum, item) => sum + parseFloat(item.fiber), 0).toFixed(1);

        document.getElementById('total-calories').textContent = totalCalories;
        document.getElementById('total-protein').textContent = `${totalProtein}g`;
        document.getElementById('total-fat').textContent = `${totalFat}g`;
        document.getElementById('total-fiber').textContent = `${totalFiber}g`;
    }
    
function updateGlass() {
  const percentage = (currentGlasses / totalGlasses) * 100;
  waterEl.style.height = percentage + '%';
  statsEl.textContent = `${currentGlasses} / ${totalGlasses} Glasses`;

  if (currentGlasses === totalGlasses) {
    messageEl.style.display = 'block';
  } else {
    messageEl.style.display = 'none';
  }
}

function drinkWater() {
  if (currentGlasses < totalGlasses) {
    currentGlasses++;
    updateGlass();
  }
}

function removeWater() {
  if (currentGlasses > 0) {
    currentGlasses--;
    updateGlass();
  }
}
function setGoal() {
  const newGoal = parseInt(goalInput.value);
  if (!isNaN(newGoal) && newGoal > 0) {
    totalGlasses = newGoal;
    currentGlasses = 0;
    updateGlass();
  }
}

updateGlass();
generateCalendar();

});
