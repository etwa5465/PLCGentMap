document.getElementById("rent-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form from refreshing page

    // Get user input
    let annualIncome = parseFloat(document.getElementById("income").value);

    if (isNaN(annualIncome) || annualIncome <= 0) {
        document.getElementById("rent-result").innerText = "Please enter a valid annual income.";
        return;
    }

    // Apply affordability formula: (Annual Income / 12) * 0.30
    let maxRent = (annualIncome / 12) * 0.30;

    // Display the result
    document.getElementById("rent-result").innerText = 
        `Based on your annual income of $${annualIncome.toLocaleString()}, you can afford up to $${maxRent.toFixed(2)} per month in rent.`;

    // Load Rent Data and Generate Maps
    fetch("data/rent-data.json")
        .then(response => response.json())
        .then(data => {
            createMap("historical-map", data.historical, maxRent);
            createMap("modern-map", data.modern, maxRent);
        })
        .catch(error => console.error("Error loading rent data:", error));
});

// Function to Create Map
function createMap(elementId, rentData, maxRent) {
    let map = L.map(elementId).setView([39.7392, -104.9903], 10); // Centered on Denver

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    rentData.forEach(location => {
        let color = location.median_rent <= maxRent ? "green" : "red"; // Affordable areas in green
        L.circleMarker([location.latitude, location.longitude], {
            color: color,
            radius: 8
        }).addTo(map)
        .bindPopup(`<strong>${location.neighborhood}</strong><br>Median Rent: $${location.median_rent}`);
    });
}
