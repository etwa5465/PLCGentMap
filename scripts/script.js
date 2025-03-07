document.getElementById("rent-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form refresh

    // Get user input
    let annualIncome = parseFloat(document.getElementById("income").value);
    let selectedDecade = document.getElementById("decade").value;

    if (isNaN(annualIncome) || annualIncome <= 0) {
        document.getElementById("rent-result").innerText = "Please enter a valid annual income.";
        document.getElementById("inflated-rent-result").innerText = "";
        return;
    }

    // Inflation Factors (Relative to 2024)
    const inflationFactors = {
        "2025": 1.00,
        "2010": 1.29,
        "2000": 1.66,
        "1990": 2.27,
        "1980": 3.58,
        "1970": 7.78,
        "1960": 10.03,
        "1950": 13.00
    };

    let inflationFactor = inflationFactors[selectedDecade];

    // Calculate Affordable Rent (Unadjusted & Adjusted)
    let maxRent = (annualIncome / 12) * 0.30;
    let maxRentInflated = maxRent / inflationFactor;

    // Display Results
    document.getElementById("rent-result").innerText = 
        `💰 Unadjusted Affordable Rent (2025 Dollars): $${maxRent.toFixed(2)} per month`;

    document.getElementById("inflated-rent-result").innerText = 
        `📉 Inflation-Adjusted Affordable Rent (for ${selectedDecade} prices): $${maxRentInflated.toFixed(2)} per month`;

    // Load Rent Data and Apply Inflation Adjustment
    fetch("data/rent-data.json")
        .then(response => response.json())
        .then(data => {
            let selectedHistoricalData = data.historical[selectedDecade] || [];
            let affordableHistorical = selectedHistoricalData.filter(n => n.median_rent <= maxRentInflated);
            let affordableModern = data.modern.filter(n => n.median_rent <= maxRent);

            console.log("Max Affordable Rent:", maxRent);
            console.log("Max Inflated Affordable Rent:", maxRentInflated);
            console.log("Selected Decade:", selectedDecade, "Inflation Factor:", inflationFactor);
            console.log("Affordable Historical Locations:", affordableHistorical);
            console.log("Affordable Modern Locations:", affordableModern);

            // Refresh the maps properly
            resetMaps();
            displayAffordableMaps(affordableHistorical, affordableModern);
        })
        .catch(error => console.error("Error loading rent data:", error));
});

// **Function to Remove Previous Maps Before Updating**
function resetMaps() {
    if (window.historicalMap) {
        window.historicalMap.remove();
    }
    if (window.modernMap) {
        window.modernMap.remove();
    }
}

// Function to Display Two Maps (Historical vs. Modern Affordability)
function displayAffordableMaps(historicalData, modernData) {
    // Ensure map containers are cleared before initializing new maps
    document.getElementById("historical-map").innerHTML = "";
    document.getElementById("modern-map").innerHTML = "";

    // Create new map instances and store them in global variables
    window.historicalMap = L.map("historical-map").setView([39.7392, -104.9903], 10);
    window.modernMap = L.map("modern-map").setView([39.7392, -104.9903], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(window.historicalMap);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(window.modernMap);

    if (historicalData.length === 0) {
        document.getElementById("historical-map").innerHTML = `<p>No affordable historical areas found.</p>`;
    } else {
        historicalData.forEach(location => {
            let marker = L.marker([location.latitude, location.longitude]).addTo(window.historicalMap);
            marker.bindPopup(`<strong>${location.neighborhood}</strong><br>Adjusted Rent: $${location.median_rent}`);
        });
    }

    if (modernData.length === 0) {
        document.getElementById("modern-map").innerHTML = `<p>No affordable modern areas found.</p>`;
    } else {
        modernData.forEach(location => {
            let marker = L.marker([location.latitude, location.longitude]).addTo(window.modernMap);
            marker.bindPopup(`<strong>${location.neighborhood}</strong><br>Median Rent: $${location.median_rent}`);
        });
    }

    console.log(`Displayed ${historicalData.length} historical locations and ${modernData.length} modern locations.`);
}
