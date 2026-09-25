// server.js

// Import Express
import express from "express";

// Create the Express application
const app = express();

// Define the port
const PORT = 3000;

// Middleware that allows Express to read JSON request bodies
app.use(express.json());


// ======================================================
// IN-MEMORY DATA
// ======================================================

// This array acts like a temporary database.
// The data will reset whenever the server restarts.

let cities = [
  {
    id: 1,
    name: "Nairobi",
    county: "Nairobi",
    population: 4397073,
  },
  {
    id: 2,
    name: "Mombasa",
    county: "Mombasa",
    population: 1208333,
  },
  {
    id: 3,
    name: "Kisumu",
    county: "Kisumu",
    population: 610082,
  },
  {
    id: 4,
    name: "Nakuru",
    county: "Nakuru",
    population: 570674,
  },
  {
    id: 5,
    name: "Eldoret",
    county: "Uasin Gishu",
    population: 475716,
  },
  {
    id: 6,
    name: "Thika",
    county: "Kiambu",
    population: 279429,
  },
  {
    id: 7,
    name: "Malindi",
    county: "Kilifi",
    population: 207253,
  },
  {
    id: 8,
    name: "Kitale",
    county: "Trans-Nzoia",
    population: 220119,
  },
];


// ======================================================
// BASIC HOME ROUTE
// ======================================================

// This route is optional.
// It simply confirms that the API server is working.


app.get("/", (req, res)=>{
    res.status(200).json({
        success: true,
        message: "Kenyan Cities API is running",
    
    });
});


// ======================================================
// TASK 1: GET /api/cities
// ======================================================

// Returns all cities.
//
// Optional query parameters:
// ?county=Nairobi
// ?minPopulation=500000
//
// Both query parameters can also be used together.

app.get("/api/cities", (req, res) => {
  // Extract query parameters from the URL
  const { county, minPopulation } = req.query;

  // Start with all cities
  let filteredCities = cities;

  // --------------------------------------------------
  // Filter by county
  // --------------------------------------------------

  if (county) {
    filteredCities = filteredCities.filter((city) => {
      return city.county.toLowerCase() === county.toLowerCase();
    });
  }

  // --------------------------------------------------
  // Filter by minimum population
  // --------------------------------------------------

  if (minPopulation) {
    // Convert the query parameter from string to number
    const minimum = Number(minPopulation);

    // Check that the population value is valid
    if (Number.isNaN(minimum)) {
      return res.status(400).json({
        success: false,
        error: "minPopulation must be a number",
      });
    }

    filteredCities = filteredCities.filter((city) => {
      return city.population > minimum;
    });
  }

  // Return the filtered results
  res.status(200).json({
    success: true,
    count: filteredCities.length,
    data: filteredCities,
  });
});


// ======================================================
// TASK 2: POST /api/cities
// ======================================================

// Creates a new city.
//
// Expected JSON body:
//
// {
//   "name": "Nanyuki",
//   "county": "Laikipia",
//   "population": 72000
// }

app.post("/api/cities", (req, res) => {
  // Get values from the request body
  const { name, county, population } = req.body;

  // --------------------------------------------------
  // Validate name and county
  // --------------------------------------------------

  if (
    typeof name !== "string" ||
    name.trim() === "" ||
    typeof county !== "string" ||
    county.trim() === ""
  ) {
    return res.status(400).json({
      success: false,
      error: "Name and county are required",
    });
  }

  // --------------------------------------------------
  // Validate population
  // --------------------------------------------------

  if (typeof population !== "number" || population <= 0) {
    return res.status(400).json({
      success: false,
      error: "Population must be a positive number",
    });
  }

  // --------------------------------------------------
  // Generate the next ID
  // --------------------------------------------------

  const nextId =
    cities.length > 0
      ? Math.max(...cities.map((city) => city.id)) + 1
      : 1;

  // Create the new city object
  const newCity = {
    id: nextId,
    name: name.trim(),
    county: county.trim(),
    population,
  };

  // Add the new city to the array
  cities.push(newCity);

  // Return 201 Created
  res.status(201).json({
    success: true,
    data: newCity,
  });
});


// ======================================================
// BONUS: GET /api/cities/:id
// ======================================================

// Returns one city using its ID.

app.get("/api/cities/:id", (req, res) => {
  // Convert the URL parameter from string to number
  const cityId = Number(req.params.id);

  // Find the city
  const city = cities.find((city) => city.id === cityId);

  // Return 404 if the city does not exist
  if (!city) {
    return res.status(404).json({
      success: false,
      error: `City with ID ${cityId} not found`,
    });
  }

  // Return the city
  res.status(200).json({
    success: true,
    data: city,
  });
});


// ======================================================
// BONUS: PATCH /api/cities/:id
// ======================================================

// Partially updates a city.
//
// Only fields included in the request body are changed.
// Other fields remain unchanged.

app.patch("/api/cities/:id", (req, res) => {
  const cityId = Number(req.params.id);

  // Find the city
  const city = cities.find((city) => city.id === cityId);

  // City does not exist
  if (!city) {
    return res.status(404).json({
      success: false,
      error: `City with ID ${cityId} not found`,
    });
  }

  // Get possible updated fields
  const { name, county, population } = req.body;

  // --------------------------------------------------
  // Validate name if supplied
  // --------------------------------------------------

  if (
    name !== undefined &&
    (typeof name !== "string" || name.trim() === "")
  ) {
    return res.status(400).json({
      success: false,
      error: "Name must be a non-empty string",
    });
  }

  // --------------------------------------------------
  // Validate county if supplied
  // --------------------------------------------------

  if (
    county !== undefined &&
    (typeof county !== "string" || county.trim() === "")
  ) {
    return res.status(400).json({
      success: false,
      error: "County must be a non-empty string",
    });
  }

  // --------------------------------------------------
  // Validate population if supplied
  // --------------------------------------------------

  if (
    population !== undefined &&
    (typeof population !== "number" || population <= 0)
  ) {
    return res.status(400).json({
      success: false,
      error: "Population must be a positive number",
    });
  }

  // --------------------------------------------------
  // Update only the provided fields
  // --------------------------------------------------

  if (name !== undefined) {
    city.name = name.trim();
  }

  if (county !== undefined) {
    city.county = county.trim();
  }

  if (population !== undefined) {
    city.population = population;
  }

  // Return updated city
  res.status(200).json({
    success: true,
    data: city,
  });
});


// ======================================================
// TASK 3: DELETE /api/cities/:id
// ======================================================

// Deletes a city using its ID.

app.delete("/api/cities/:id", (req, res) => {
  // Get the city ID from the URL
  const cityId = Number(req.params.id);

  // Find the position of the city in the array
  const cityIndex = cities.findIndex((city) => {
    return city.id === cityId;
  });

  // --------------------------------------------------
  // City not found
  // --------------------------------------------------

  if (cityIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `City with ID ${cityId} not found`,
    });
  }

  // --------------------------------------------------
  // Remove the city
  // --------------------------------------------------

  const deletedCity = cities.splice(cityIndex, 1)[0];

  // Return successful response
  res.status(200).json({
    success: true,
    message: "City deleted",
    data: deletedCity,
  });
});


// ======================================================
// 404 FALLBACK
// ======================================================

// Runs when the user requests an endpoint that does not exist.

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});


// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});