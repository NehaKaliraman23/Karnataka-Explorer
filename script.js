const form = document.getElementById("travelForm");
const result = document.getElementById("result");

// Estimated demo costs per person per day
const dailyCosts = {
    solo: { stay: 1000, food: 500, transport: 400, activities: 300 },
    family: { stay: 700, food: 400, transport: 300, activities: 250 },
    friends: { stay: 600, food: 350, transport: 250, activities: 300 },
    couple: { stay: 900, food: 450, transport: 300, activities: 350 }
};

const mapLinks = {
    "Coorg": "https://www.google.com/maps/search/?api=1&query=Coorg+Karnataka",
    "Jog Falls": "https://www.google.com/maps/search/?api=1&query=Jog+Falls+Karnataka",
    "Chikmagalur": "https://www.google.com/maps/search/?api=1&query=Chikmagalur+Karnataka",
    "Mysuru Palace": "https://www.google.com/maps/search/?api=1&query=Mysore+Palace",
    "Hampi": "https://www.google.com/maps/search/?api=1&query=Hampi+Karnataka",
    "Badami": "https://www.google.com/maps/search/?api=1&query=Badami+Karnataka",
    "Mysuru": "https://www.google.com/maps/search/?api=1&query=Mysuru+Karnataka",
    "Belur": "https://www.google.com/maps/search/?api=1&query=Belur+Karnataka",
    "Udupi": "https://www.google.com/maps/search/?api=1&query=Udupi+Karnataka",
    "Dandeli": "https://www.google.com/maps/search/?api=1&query=Dandeli+Karnataka"
};

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const city = document.getElementById("city").value.trim();
    const days = Number(document.getElementById("days").value);
    const budget = Number(document.getElementById("budget").value);
    const interest = document.getElementById("interest").value;
    const travellers = document.getElementById("travellers").value;

    if (!city || !days || budget <= 0 || !interest || !travellers) {
        result.textContent = "Please enter valid details for your trip.";
        return;
    }

    // Show loading message while AI generates the plan
    result.innerHTML = `
        <div class="day-card">
            <h2>🤖 AI is creating your travel plan...</h2>
            <p>Please wait. This may take a few seconds.</p>
        </div>
    `;

    try {
        // Send form details to our Node.js backend
        const response = await fetch("/api/plan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                city,
                days,
                budget,
                interest,
                travellers
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to generate AI plan.");
        }

        if (!data.plan) {
            throw new Error("AI returned an empty travel plan.");
        }

        // Calculate illustrative budget breakdown
        const cost = dailyCosts[travellers] || dailyCosts.friends;

        const stayCost = cost.stay * days;
        const foodCost = cost.food * days;
        const transportCost = cost.transport * days;
        const activitiesCost = cost.activities * days;

        const totalCost =
            stayCost + foodCost + transportCost + activitiesCost;

        const remainingBudget = budget - totalCost;

        let budgetSuggestion = "";

        if (remainingBudget >= 0) {
            budgetSuggestion = `
                <p>✅ Your illustrative estimated cost is within your budget.</p>
                <p>💡 Keep some money aside for unexpected expenses.</p>
            `;
        } else {
            budgetSuggestion = `
                <p>⚠️ Your illustrative estimated cost is above your budget.</p>
                <p>💡 Consider simpler accommodation or fewer paid activities.</p>
                <p>Estimated extra amount: ₹${Math.abs(remainingBudget).toLocaleString("en-IN")}</p>
            `;
        }

        // Build destination map links
        const mapButtons = Object.entries(mapLinks).map(([name, url]) => `
            <p>
                <a href="${url}" target="_blank" rel="noopener noreferrer">
                    📍 View ${escapeHTML(name)} on Google Maps
                </a>
            </p>
        `).join("");

        // Display the actual response returned by the AI
        const plan = `
            <h2>🤖 Your AI-Generated Karnataka Travel Plan</h2>

            <p><strong>Starting city:</strong> ${escapeHTML(city)}</p>
            <p><strong>Duration:</strong> ${days} day(s)</p>
            <p><strong>Your budget:</strong> ₹${budget.toLocaleString("en-IN")}</p>
            <p><strong>Travelling with:</strong> ${escapeHTML(travellers)}</p>
            <p><strong>Interest:</strong> ${escapeHTML(interest)}</p>

            <hr>

            <div class="day-card">
                <h3>✨ Personalized itinerary from AI</h3>
                <div class="ai-plan">${escapeHTML(data.plan).replace(/\n/g, "<br>")}</div>
            </div>


            <div class="day-card">
                <h3>📍 Google Maps</h3>
                <p>Open a destination to view its location:</p>
                ${mapButtons}
            </div>

            <p><strong>Important:</strong> AI suggestions and estimated prices may not be exact.
            Check routes, opening hours and current costs before travelling.</p>
        `;

        result.innerHTML = plan;

        // Download the generated plan
        const downloadButton = document.createElement("button");
        downloadButton.textContent = "📥 Download My Travel Plan";
        downloadButton.type = "button";

        downloadButton.addEventListener("click", function () {
            const travelPlanText = result.innerText;

            const file = new Blob([travelPlanText], {
                type: "text/plain;charset=utf-8"
            });

            const downloadLink = document.createElement("a");
            const fileURL = URL.createObjectURL(file);

            downloadLink.href = fileURL;
            downloadLink.download = "My-Karnataka-Travel-Plan.txt";

            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();

            URL.revokeObjectURL(fileURL);
        });

        result.appendChild(downloadButton);
        result.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        console.error("Travel plan error:", error);

        result.innerHTML = `
            <div class="day-card">
                <h3>❌ AI Plan Could Not Be Generated</h3>
                <p>${escapeHTML(error.message || "Something went wrong.")}</p>
                <p>Check that the server is running and your API key is configured correctly.</p>
            </div>
        `;
    }
});

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}