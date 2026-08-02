/* ==========================================================================
   AGRO-INTEL SUITE - CORE APPLICATION SCRIPT
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  const state = {
    theme: localStorage.getItem("agro_theme") || "dark",
    region: "punjab",
    unit: "metric", // 'metric' (°C, km/h) or 'imperial' (°F, mph)
    activeChartTab: "rain", // 'rain', 'temp', 'humid'
    activeMapLayer: "default", // 'default', 'ndvi', 'moisture', 'temp'
    activeTreatmentTab: "organic", // 'organic', 'chemical', 'irrigation', 'prevention'
    currentDiseaseResult: null,
    isScanning: false,
    cameraStream: null
  };

  // ==========================================================================
  // REGION DATABASE (Dynamic telemetry data)
  // ==========================================================================
  const regionalData = {
    punjab: {
      name: "Punjab Plains",
      coords: [30.7333, 76.7794], // Chandigarh / Punjab area
      moisture: "42.1%",
      ndvi: 0.81,
      pestRisk: "Medium",
      pestRiskDesc: "Humid conditions increasing risk of Leaf Spot",
      alerts: "No major weather warnings",
      alertsDesc: "Favorable conditions for rice planting",
      alertType: "normal", // 'normal', 'warning', 'danger'
      weather: {
        temp: 34, // Celsius
        humidity: 68,
        wind: 12, // km/h
        rainProb: 30,
        pressure: 1008,
        condition: "Hazy Sun",
        icon: "fa-solid fa-cloud-sun",
        forecast: [
          { day: "Wed", icon: "fa-solid fa-sun", temp: 35, rainProb: 10 },
          { day: "Thu", icon: "fa-solid fa-cloud-sun", temp: 34, rainProb: 20 },
          { day: "Fri", icon: "fa-solid fa-cloud-showers-heavy", temp: 31, rainProb: 70 },
          { day: "Sat", icon: "fa-solid fa-cloud-rain", temp: 32, rainProb: 60 },
          { day: "Sun", icon: "fa-solid fa-cloud-sun", temp: 34, rainProb: 30 }
        ]
      },
      aqi: {
        score: 115,
        status: "Moderate",
        class: "badge-moderate",
        recommendation: "Sensitive groups (elderly, asthmatic) should wear masks during field plowing operations due to soil dust PM10.",
        pm25: 42,
        pm10: 105,
        no2: 14,
        o3: 56
      },
      analytics: {
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        rainfall: [18, 24, 15, 8, 22, 160], // mm
        temp: [14, 18, 24, 30, 35, 34], // °C
        humidity: [72, 65, 50, 42, 45, 68] // %
      },
      advisories: {
        irrigation: "Irrigate paddy fields tonight to maintain standing water depth of 4cm. Soil moisture is moderate at 42.1%.",
        fertilizer: "Apply Top-dressed Nitrogen (Urea) at 45 kg/hectare. Ensure calm winds below 15 km/h before spraying nitrogen solutions.",
        harvesting: "Prepare threshing floors for wheat. Optimum sowing window for direct seeded rice is open; seed depth: 3cm.",
        pest: "High humidity may trigger Bacterial Blight in rice nursery beds. Keep field bunds clean and spray copper oxychloride if spots appear."
      }
    },
    us_midwest: {
      name: "US Midwest Corn Belt",
      coords: [41.8781, -87.6298], // Centered around Illinois/Midwest
      moisture: "36.4%",
      ndvi: 0.74,
      pestRisk: "Low",
      pestRiskDesc: "No active pest outbreaks detected",
      alerts: "High Wind Warning",
      alertsDesc: "Gusts up to 50 km/h starting tonight",
      alertType: "warning",
      weather: {
        temp: 22,
        humidity: 54,
        wind: 32,
        rainProb: 15,
        pressure: 1014,
        condition: "Windy & Sunny",
        icon: "fa-solid fa-wind",
        forecast: [
          { day: "Wed", icon: "fa-solid fa-wind", temp: 21, rainProb: 10 },
          { day: "Thu", icon: "fa-solid fa-sun", temp: 24, rainProb: 0 },
          { day: "Fri", icon: "fa-solid fa-cloud-sun", temp: 26, rainProb: 15 },
          { day: "Sat", icon: "fa-solid fa-cloud-sun", temp: 25, rainProb: 25 },
          { day: "Sun", icon: "fa-solid fa-cloud-rain", temp: 20, rainProb: 60 }
        ]
      },
      aqi: {
        score: 38,
        status: "Good",
        class: "badge-good",
        recommendation: "Excellent air quality. High visual clarity. Standard working conditions for all planting machinery operations.",
        pm25: 9,
        pm10: 22,
        no2: 6,
        o3: 32
      },
      analytics: {
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        rainfall: [55, 62, 78, 95, 110, 98],
        temp: [-3, 1, 7, 13, 19, 23],
        humidity: [76, 72, 68, 64, 62, 60]
      },
      advisories: {
        irrigation: "Delay corn field pivot irrigation; high wind speed (32 km/h) will blow spray vectors away, causing uneven irrigation patterns.",
        fertilizer: "Do not apply anhydrous ammonia liquid fertilizers under current high wind advisories to avoid localized drifting hazards.",
        harvesting: "Corn vegetative V6 stage reached. Soil temperatures are steady at 18°C. Perfect timeline for mechanical crop weed weeding.",
        pest: "Monitor corn fields for European Corn Borer moths. Light traps are showing minor activity, but below economic threshold."
      }
    },
    andalusia: {
      name: "Andalusian Hills",
      coords: [37.3891, -5.9845], // Seville / Andalusia
      moisture: "22.5%",
      ndvi: 0.58,
      pestRisk: "High",
      pestRiskDesc: "Heat and low moisture triggering Olive Fruit Fly activity",
      alerts: "Extreme Heat Warning",
      alertsDesc: "Temperatures exceeding 40°C forecast",
      alertType: "danger",
      weather: {
        temp: 39,
        humidity: 28,
        wind: 8,
        rainProb: 5,
        pressure: 1010,
        condition: "Hot & Clear",
        icon: "fa-solid fa-temperature-arrow-up",
        forecast: [
          { day: "Wed", icon: "fa-solid fa-sun", temp: 40, rainProb: 0 },
          { day: "Thu", icon: "fa-solid fa-sun", temp: 41, rainProb: 0 },
          { day: "Fri", icon: "fa-solid fa-sun", temp: 39, rainProb: 0 },
          { day: "Sat", icon: "fa-solid fa-cloud-sun", temp: 37, rainProb: 10 },
          { day: "Sun", icon: "fa-solid fa-sun", temp: 38, rainProb: 0 }
        ]
      },
      aqi: {
        score: 65,
        status: "Moderate",
        class: "badge-moderate",
        recommendation: "Slight dust haze (Calima) incoming from Sahara. Limit heavy manual labor during peak afternoon heat (13:00 - 17:00).",
        pm25: 18,
        pm10: 52,
        no2: 8,
        o3: 52
      },
      analytics: {
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        rainfall: [64, 55, 48, 32, 15, 3],
        temp: [11, 13, 16, 19, 25, 31],
        humidity: [74, 68, 62, 54, 46, 32]
      },
      advisories: {
        irrigation: "CRITICAL: Implement deep drip irrigation cycles for olive groves. Transpiration is extremely high. Soil moisture at low 22.5%.",
        fertilizer: "Apply leaf potassium spray on olive trees to reduce water stress. Avoid soil-applied dry fertilizers as they won't dissolve.",
        harvesting: "Olive pruning completed. Clear dried wood to eliminate fuel and protect groves from wildfire risks under extreme heat.",
        pest: "High Risk: Olive Fruit Fly (Bactrocera oleae) active. Deploy pheromone monitoring traps immediately. Check grape vines for Powdery Mildew."
      }
    },
    nile_delta: {
      name: "Nile Delta Basin",
      coords: [30.9833, 31.1667], // Nile Delta region
      moisture: "48.5%",
      ndvi: 0.84,
      pestRisk: "Low",
      pestRiskDesc: "Standard crop conditions",
      alerts: "No major weather warnings",
      alertsDesc: "Normal seasonal river delta moisture flow",
      alertType: "normal",
      weather: {
        temp: 31,
        humidity: 61,
        wind: 16,
        rainProb: 0,
        pressure: 1012,
        condition: "Clear Sky",
        icon: "fa-solid fa-sun",
        forecast: [
          { day: "Wed", icon: "fa-solid fa-sun", temp: 31, rainProb: 0 },
          { day: "Thu", icon: "fa-solid fa-sun", temp: 32, rainProb: 0 },
          { day: "Fri", icon: "fa-solid fa-sun", temp: 31, rainProb: 0 },
          { day: "Sat", icon: "fa-solid fa-sun", temp: 32, rainProb: 0 },
          { day: "Sun", icon: "fa-solid fa-sun", temp: 33, rainProb: 0 }
        ]
      },
      aqi: {
        score: 82,
        status: "Moderate",
        class: "badge-moderate",
        recommendation: "Satisfactory air quality, though minor industrial particulate drift from Cairo is noted. Favorable for cotton sowing.",
        pm25: 26,
        pm10: 64,
        no2: 16,
        o3: 41
      },
      analytics: {
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        rainfall: [12, 10, 5, 2, 1, 0],
        temp: [14, 16, 19, 23, 27, 30],
        humidity: [65, 62, 60, 58, 58, 62]
      },
      advisories: {
        irrigation: "Sustain scheduled gravity-fed canal irrigation. Delta soil humidity is stable at 48.5%. Avoid waterlogging cotton roots.",
        fertilizer: "Apply slow-release Nitrogen-Phosphorus fertilizer. Rich alluvial soil retains phosphorus well; optimize ratios accordingly.",
        harvesting: "Prepare cotton seed beds. Excellent weather window for harvesting alfalfa cuts. Maintain seedbed soil packing.",
        pest: "Monitor cotton plants for Cotton Leafworm eggs. Look under leaves and manually remove egg masses during early developmental checks."
      }
    }
  };

  // ==========================================================================
  // PLANT DOCTOR DISEASE DATA
  // ==========================================================================
  const plantDiseases = {
    healthy: {
      name: "Healthy Plant Leaf",
      confidence: 98,
      severity: "Healthy",
      class: "badge-low-risk",
      description: "The plant leaf shows normal pigment distribution, intact cell walls, and no signs of pathogenic attack or nutritional deficiencies. Chlorophyll levels are optimal.",
      causes: "Excellent farm management, consistent watering schedules, clean soil conditions, and optimal solar exposure.",
      organic: [
        "Continue standard preventative spraying of organic neem oil once every 3 weeks to prevent pest vectors.",
        "Add rich organic vermicompost around root zones to maintain soil nutrient reserves.",
        "Practice companion planting (e.g., marigolds next to tomatoes) to naturally repel nematodes."
      ],
      chemical: [
        "No chemical fungicides or bactericides required.",
        "If minor pest sightings occur, spot-apply insecticidal soaps rather than broad-spectrum synthetic pesticides."
      ],
      irrigation: [
        "Maintain current drip irrigation schedules based on local evapotranspiration sensor data.",
        "Water early in the morning to reduce leaf surface wetness and evaporation loss."
      ],
      prevention: [
        "Sanitize garden tools and clippers before moving between different crop sections.",
        "Perform routine inspections on the undersides of leaves weekly.",
        "Ensure adequate plant-to-plant air ventilation gaps to prevent mold spores from taking hold."
      ]
    },
    blight: {
      name: "Early Blight (Alternaria solani)",
      confidence: 92,
      severity: "Mild Risk",
      class: "badge-mild-risk",
      description: "A very common fungal disease affecting tomato and potato crops. It is characterized by small, brown-black concentric target-like spots appearing first on older lower leaves, causing eventual leaf yellowing and drop.",
      causes: "Fungal spores overwintering in soil debris, prolonged leaf wetness, heavy dews, high relative humidity, and splashes of rain carrying soil spores upward.",
      organic: [
        "Prune and burn lower infected leaves immediately to prevent spores from splashing upward.",
        "Apply organic copper-based liquid sprays or sulfur fungicides at the first sign of symptoms.",
        "Mulch the soil surface with clean straw or wood chips to block soil-borne spores from splashing onto lower foliage."
      ],
      chemical: [
        "Apply chlorothalonil, mancozeb, or azoxystrobin fungicides under dry windless forecast conditions.",
        "Rotate chemistry groups to prevent pathogen resistance development."
      ],
      irrigation: [
        "Switch from overhead sprinkler irrigation to ground-level drip lines or drip tape immediately.",
        "Water crop rows strictly in early morning to allow leaves to dry rapidly in daylight."
      ],
      prevention: [
        "Implement a strict 3-year crop rotation schedule (avoid planting nightshades like tomatoes, potatoes, eggplants in succession).",
        "Select certified disease-resistant crop seed varieties.",
        "Apply preventative bio-fungicides containing Bacillus subtilis to the soil at transplant."
      ]
    },
    rust: {
      name: "Foliar Rust Fungi (Puccinia spp.)",
      confidence: 95,
      severity: "High Risk",
      class: "badge-high-risk",
      description: "A highly contagious airborne fungal disease that displays as orange-yellow or reddish-brown powdery pustules (spores) on leaf undersides and stems. Can quickly defoliate crops and dramatically reduce grain yields.",
      causes: "Airborne fungal spore migration, cool damp morning temperatures, persistent canopy humidity, and susceptible monoculture cropping patterns.",
      organic: [
        "Apply organic copper fungicides or baking soda sprays (potassium bicarbonate) to raise leaf surface pH, killing germinating spores.",
        "Quickly destroy heavily infected plants; do not compost rust-infected tissue as spores survive.",
        "Apply garlic extract sprays, which act as a natural organic fungicide against rust spores."
      ],
      chemical: [
        "Spray systemic triazole fungicides (such as tebuconazole or propiconazole) to arrest spreading infection.",
        "Apply strobilurin fungicides preventatively in high-infection warning zones."
      ],
      irrigation: [
        "Promote dry foliage: avoid all night watering.",
        "Ensure wide crop row spacing to maximize solar penetration and lower humidity in the plant canopy."
      ],
      prevention: [
        "Sow rust-resistant cultivars of cereal grains/vegetables.",
        "Eradicate wild alternative weed hosts (like wild grasses or barberry bushes) near field boundaries.",
        "Balance nitrogen applications; excessive nitrogen creates soft, lush leaf tissue highly vulnerable to rust penetration."
      ]
    },
    leaf_spot: {
      name: "Septoria Leaf Spot",
      confidence: 89,
      severity: "Mild Risk",
      class: "badge-mild-risk",
      description: "A common fungal infection causing numerous tiny, circular spots with dark brown margins and grey centers. Spreads from base foliage upward, reducing photosynthesis and weakening overall yield.",
      causes: "Warm temperatures (20-25°C), high leaf wetness, tight crop spacing restricting air movement, and leaving crop residue on field soil.",
      organic: [
        "Apply compost tea sprays or liquid copper fungicides.",
        "Remove all bottom leaves up to 12 inches high on tomatoes to prevent soil-splashed spores.",
        "Clean all stakes and cages with a 10% bleach solution at season end."
      ],
      chemical: [
        "Utilize protectant fungicides containing chlorothalonil or copper ammonium complex.",
        "Begin spraying preventatively when weather forecasts indicate consecutive warm, humid days."
      ],
      irrigation: [
        "Strictly avoid overhead watering. Use drip emitters.",
        "Do not work in the fields or harvest crops when plants are wet from dew or rain to prevent spreading spores."
      ],
      prevention: [
        "Thoroughly clean up and till under all plant debris in autumn.",
        "Space plants at least 3 feet apart to permit high air circulation.",
        "Mulch rows to prevent soil splashback."
      ]
    },
    mildew: {
      name: "Powdery Mildew (Erysiphe spp.)",
      confidence: 93,
      severity: "Mild Risk",
      class: "badge-mild-risk",
      description: "A prominent fungal disease producing a white, flour-like powdery coating on leaf surfaces, shoots, and fruit. It causes leaf curling, stunting, and premature drying.",
      causes: "Shady field areas, high relative humidity at night followed by warm dry days, and lack of direct sunlight on leaves.",
      organic: [
        "Spray leaves with a diluted organic milk solution (1 part milk to 9 parts water) under direct sunlight; proteins in milk create natural free radicals that kill the fungus.",
        "Spray organic neem oil solutions or potassium bicarbonate on leaf surfaces.",
        "Prune crowded inner stems to increase sunlight penetration to lower leaves."
      ],
      chemical: [
        "Apply sulfur fungicides or systemic options like myclobutanil.",
        "Apply protectant strobilurins early in the disease development cycle."
      ],
      irrigation: [
        "Sprinkle watering (overhead) can actually help wash off powdery mildew spores, but check that it doesn't trigger other diseases like blight.",
        "Irrigate in mid-morning so the foliage drys before noon."
      ],
      prevention: [
        "Plant crops in locations that receive a minimum of 6 hours of direct sunlight daily.",
        "Avoid late-season heavy nitrogen applications.",
        "Select powdery mildew resistant cultivars."
      ]
    },
    wilt: {
      name: "Bacterial Wilt (Ralstonia solani)",
      confidence: 91,
      severity: "High Risk",
      class: "badge-high-risk",
      description: "A highly destructive soil-borne bacterial disease. It enters the plant through roots and multiplies rapidly, clogging water-conducting xylem vessels, leading to sudden daytime wilting and crop death while leaves remain green.",
      causes: "Soil-borne bacteria persisting for years, wet soils with high temperatures (28-35°C), nematode damage to root systems creating entry wounds.",
      organic: [
        "Immediately pull out and burn wilted plants; do not leave roots in the soil.",
        "Drench soil with beneficial antagonistic bacteria (like Pseudomonas fluorescens) to suppress Ralstonia populations.",
        "Grow bio-fumigant green manures like mustard greens and till them into the soil before planting."
      ],
      chemical: [
        "No chemical sprays are effective once a plant is infected internally.",
        "Treat soil for root-knot nematodes using organic/chemical nematicides, as root wounds allow bacterial entry."
      ],
      irrigation: [
        "Improve field drainage immediately: create raised planting beds.",
        "Do not allow irrigation water to flow from infected zones of the field to healthy crops."
      ],
      prevention: [
        "Raise soil pH to 6.5-7.0.",
        "Rotate nightshades with non-host crops like corn, sorghum, or grass for at least 4 seasons.",
        "Graft susceptible high-yield crops onto resistant wild rootstocks."
      ]
    }
  };

  // ==========================================================================
  // INITIALIZATION & EVENT BINDINGS
  // ==========================================================================
  let myChart = null;
  let myMap = null;
  let mapMarkers = [];
  let mapOverlays = [];

  function init() {
    setupTheme();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Initial UI populate
    updateDashboardData();
    initChart();
    initMap();

    // Event Listeners
    document.getElementById("region-select").addEventListener("change", handleRegionChange);
    document.getElementById("unit-toggle-btn").addEventListener("click", handleUnitToggle);
    document.getElementById("theme-toggle-btn").addEventListener("click", toggleTheme);
    
    // Sidebar active view switcher
    setupSidebarNavigation();

    // Crop Form range syncs
    syncSliders();
    document.getElementById("btn-recommend-crop").addEventListener("click", runCropRecommendation);

    // AI Plant Doctor Actions
    setupPlantDoctorActions();

    // Chatbot actions
    setupChatbot();
    
    // Live Ticker message cycle
    startTickerAnimation();
  }

  // ==========================================================================
  // GENERAL UTILS & STATE UI SYNCS
  // ==========================================================================
  function updateDateTime() {
    const dateLabel = document.getElementById("current-date-time");
    if (!dateLabel) return;
    
    const now = new Date();
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);
    const timeStr = now.toTimeString().split(' ')[0];
    dateLabel.innerHTML = `<i class="fa-solid fa-clock"></i> ${dateStr} - ${timeStr} | System Normal`;
  }

  function setupTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    const themeIcon = document.querySelector("#theme-toggle-btn i");
    if (themeIcon) {
      themeIcon.className = state.theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
  }

  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("agro_theme", state.theme);
    setupTheme();
    
    if (myMap) {
      updateMapBaseLayer();
    }
  }

  function handleRegionChange(e) {
    state.region = e.target.value;
    updateDashboardData();
    updateChart();
    updateMapPosition();
    updateTickerAlerts();
  }

  function handleUnitToggle() {
    state.unit = state.unit === "metric" ? "imperial" : "metric";
    
    const label = document.getElementById("unit-label");
    label.innerText = state.unit === "metric" ? "°C / Metric" : "°F / Imperial";
    
    updateDashboardData();
    updateChart();
  }

  function setupSidebarNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const mobileToggle = document.getElementById("mobile-sidebar-toggle");
    const sidebar = document.getElementById("sidebar");

    navItems.forEach(item => {
      item.addEventListener("click", (e) => {
        navItems.forEach(nav => nav.classList.remove("active"));
        item.classList.add("active");
        
        if (sidebar.classList.contains("mobile-active")) {
          sidebar.classList.remove("mobile-active");
          mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
      });
    });

    mobileToggle.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-active");
      if (sidebar.classList.contains("mobile-active")) {
        mobileToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      } else {
        mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });

    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 992) {
        if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target) && sidebar.classList.contains("mobile-active")) {
          sidebar.classList.remove("mobile-active");
          mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
      }
    });
  }

  function syncSliders() {
    const tempInput = document.getElementById("temp-input");
    const tempSlider = document.getElementById("temp-slider");
    const rainInput = document.getElementById("rainfall-input");
    const rainSlider = document.getElementById("rainfall-slider");

    tempInput.addEventListener("input", (e) => {
      tempSlider.value = e.target.value;
    });
    tempSlider.addEventListener("input", (e) => {
      tempInput.value = e.target.value;
    });

    rainInput.addEventListener("input", (e) => {
      rainSlider.value = e.target.value;
    });
    rainSlider.addEventListener("input", (e) => {
      rainInput.value = e.target.value;
    });
  }

  function convertTemp(celsius) {
    if (state.unit === "metric") return `${celsius}°C`;
    const fahr = Math.round((celsius * 9) / 5 + 32);
    return `${fahr}°F`;
  }

  function convertWind(kmh) {
    if (state.unit === "metric") return `${kmh} km/h`;
    const mph = Math.round(kmh * 0.621371);
    return `${mph} mph`;
  }

  // ==========================================================================
  // DASHBOARD TELEMETRY LOADER
  // ==========================================================================
  function updateDashboardData() {
    const data = regionalData[state.region];
    
    document.getElementById("quick-stat-moisture").innerText = data.moisture;
    document.getElementById("quick-stat-ndvi").innerText = data.ndvi;
    document.getElementById("quick-stat-pest").innerText = data.pestRisk;
    document.getElementById("quick-stat-pest-desc").innerText = data.pestRiskDesc;
    
    const alertVal = document.getElementById("quick-stat-alerts");
    const alertDesc = document.getElementById("quick-stat-alerts-desc");
    alertVal.innerText = data.alertType === "normal" ? "Normal" : "1 Alert";
    alertVal.className = `stat-value ${data.alertType === "danger" ? "text-red" : data.alertType === "warning" ? "text-yellow" : "text-green"}`;
    alertDesc.innerText = data.alerts;
    
    document.getElementById("weather-temp").innerText = Math.round(state.unit === "metric" ? data.weather.temp : (data.weather.temp * 9/5 + 32));
    document.querySelector(".weather-temp-block .temp-unit").innerText = state.unit === "metric" ? "°C" : "°F";
    document.getElementById("weather-humidity").innerText = `${data.weather.humidity}%`;
    document.getElementById("weather-wind").innerText = convertWind(data.weather.wind);
    document.getElementById("weather-rain-prob").innerText = `${data.weather.rainProb}%`;
    document.getElementById("weather-pressure").innerText = `${data.weather.pressure} hPa`;
    document.getElementById("weather-condition").innerText = data.weather.condition;
    
    const mainIcon = document.getElementById("weather-main-icon");
    mainIcon.innerHTML = `<i class="${data.weather.icon}"></i>`;
    
    const alertCard = document.getElementById("weather-alerts-box");
    const alertTitle = document.getElementById("weather-alert-title");
    const alertText = document.getElementById("weather-alert-desc");
    
    alertCard.className = `weather-alert-card ${data.alertType}`;
    if (data.alertType === "normal") {
      alertCard.classList.add("hidden");
    } else {
      alertCard.classList.remove("hidden");
      alertTitle.innerText = data.alerts;
      alertText.innerText = data.alertsDesc;
    }

    const forecastContainer = document.getElementById("weather-forecast-list");
    forecastContainer.innerHTML = "";
    data.weather.forecast.forEach(item => {
      const fTemp = state.unit === "metric" ? item.temp : Math.round((item.temp * 9/5) + 32);
      forecastContainer.innerHTML += `
        <div class="forecast-day-card">
          <span class="forecast-day-name">${item.day}</span>
          <div class="forecast-icon"><i class="${item.icon}"></i></div>
          <span class="forecast-temp">${fTemp}°</span>
          <span class="forecast-pop"><i class="fa-solid fa-droplet"></i> ${item.rainProb}%</span>
        </div>
      `;
    });

    document.getElementById("aqi-value").innerText = data.aqi.score;
    const aqiStatus = document.getElementById("aqi-status");
    aqiStatus.innerText = data.aqi.status;
    
    aqiStatus.className = "aqi-status-badge";
    if (data.aqi.score <= 50) aqiStatus.classList.add("badge-good");
    else if (data.aqi.score <= 100) aqiStatus.classList.add("badge-good");
    else aqiStatus.classList.add("badge-moderate");

    document.getElementById("aqi-health-tips").innerText = data.aqi.recommendation;
    
    document.getElementById("pollutant-pm25-val").innerText = `${data.aqi.pm25} µg/m³`;
    document.getElementById("pollutant-pm25-bar").style.width = `${Math.min(data.aqi.pm25 * 2.5, 100)}%`;
    
    document.getElementById("pollutant-pm10-val").innerText = `${data.aqi.pm10} µg/m³`;
    document.getElementById("pollutant-pm10-bar").style.width = `${Math.min(data.aqi.pm10 * 0.8, 100)}%`;
    
    document.getElementById("pollutant-no2-val").innerText = `${data.aqi.no2} ppb`;
    document.getElementById("pollutant-no2-bar").style.width = `${Math.min(data.aqi.no2 * 2.0, 100)}%`;
    
    document.getElementById("pollutant-o3-val").innerText = `${data.aqi.o3} ppb`;
    document.getElementById("pollutant-o3-bar").style.width = `${Math.min(data.aqi.o3 * 1.5, 100)}%`;

    const aqiPercent = Math.min(data.aqi.score / 200, 1);
    const strokeOffset = 314 - (314 * aqiPercent);
    const progressCircle = document.getElementById("aqi-progress-bar");
    progressCircle.style.strokeDashoffset = strokeOffset;
    
    if (data.aqi.score <= 50) progressCircle.style.stroke = "#10b981";
    else if (data.aqi.score <= 100) progressCircle.style.stroke = "#f59e0b";
    else progressCircle.style.stroke = "#f97316";

    document.getElementById("irrigation-status").innerText = data.advisories.irrigation;
    document.getElementById("fertilizer-suggestions").innerText = data.advisories.fertilizer;
    document.getElementById("harvesting-timeline").innerText = data.advisories.harvesting;
    document.getElementById("pest-risk-advisory").innerText = data.advisories.pest;

    const pestBadge = document.getElementById("pest-risk-badge");
    pestBadge.innerText = `${data.pestRisk} Risk`;
    pestBadge.className = `badge ${data.pestRisk === "High" ? "badge-danger" : data.pestRisk === "Medium" ? "badge-tips" : "badge-normal"}`;

    document.getElementById("temp-input").value = data.weather.temp;
    document.getElementById("temp-slider").value = data.weather.temp;
    
    let defaultRain = 1200;
    if (state.region === "punjab") defaultRain = 750;
    else if (state.region === "us_midwest") defaultRain = 950;
    else if (state.region === "andalusia") defaultRain = 400;
    else if (state.region === "nile_delta") defaultRain = 100;
    document.getElementById("rainfall-input").value = defaultRain;
    document.getElementById("rainfall-slider").value = defaultRain;
  }

  function updateTickerAlerts() {
    const data = regionalData[state.region];
    const ticker = document.getElementById("alert-ticker-container");
    ticker.innerText = `Region switched to ${data.name}. Current average Soil moisture stands at ${data.moisture}. Alert status: ${data.alerts}. Sowing suitability calculated at 92%.`;
  }

  function startTickerAnimation() {
    let index = 0;
    const tickerContainer = document.getElementById("alert-ticker-container");
    
    const systemBulletins = [
      "Satellite NDVI sensor stream processing active. Canopy biomass yields rising.",
      "Soil moisture telemetry network stable. Next regional forecast update in 12 mins.",
      "AI Crop Matchmaker parameters recalculated. Optimal planting depth calibrated.",
      "AI Plant Doctor vision classifier ready. Upload leaf image to run quick diagnostics."
    ];

    setInterval(() => {
      if (state.region) {
        if (Math.random() > 0.6) {
          tickerContainer.innerText = systemBulletins[index];
          index = (index + 1) % systemBulletins.length;
        }
      }
    }, 15000);
  }

  // ==========================================================================
  // CHART.JS INTEGRATION
  // ==========================================================================
  function initChart() {
    const ctx = document.getElementById("analytics-chart-canvas").getContext("2d");
    const data = regionalData[state.region].analytics;
    
    myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.months,
        datasets: [{
          label: "Historical Mean (10-yr Average)",
          data: getChartDataset("rain"),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#10b981"
        }, {
          label: "Current Year Telemetry & Projection",
          data: getChartDataset("rain").map(val => Math.round(val * (0.9 + Math.random() * 0.2))),
          borderColor: "#0ea5e9",
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.35,
          pointBackgroundColor: "#0ea5e9"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: state.theme === "dark" ? "#a3b8ad" : "#4a6657",
              font: { family: "Inter", size: 12 }
            }
          }
        },
        scales: {
          x: {
            grid: { color: state.theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(16,185,129,0.08)" },
            ticks: { color: state.theme === "dark" ? "#a3b8ad" : "#4a6657" }
          },
          y: {
            grid: { color: state.theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(16,185,129,0.08)" },
            ticks: { color: state.theme === "dark" ? "#a3b8ad" : "#4a6657" },
            title: {
              display: true,
              text: "Precipitation (mm)",
              color: state.theme === "dark" ? "#a3b8ad" : "#4a6657"
            }
          }
        }
      }
    });

    document.getElementById("btn-chart-rain").addEventListener("click", () => switchChartTab("rain"));
    document.getElementById("btn-chart-temp").addEventListener("click", () => switchChartTab("temp"));
    document.getElementById("btn-chart-humid").addEventListener("click", () => switchChartTab("humid"));
  }

  function getChartDataset(type) {
    const raw = regionalData[state.region].analytics;
    if (type === "rain") return raw.rainfall;
    if (type === "humid") return raw.humidity;
    
    if (type === "temp") {
      if (state.unit === "metric") return raw.temp;
      return raw.temp.map(t => Math.round((t * 9) / 5 + 32));
    }
    return [];
  }

  function switchChartTab(tab) {
    state.activeChartTab = tab;
    
    document.querySelectorAll(".analytics-tab-btn").forEach(btn => btn.classList.remove("active"));
    if (tab === "rain") document.getElementById("btn-chart-rain").classList.add("active");
    if (tab === "temp") document.getElementById("btn-chart-temp").classList.add("active");
    if (tab === "humid") document.getElementById("btn-chart-humid").classList.add("active");

    updateChart();
  }

  function updateChart() {
    if (!myChart) return;
    
    const type = state.activeChartTab;
    const data = getChartDataset(type);
    
    let yTitle = "";
    let mainColor = "#10b981";
    let subColor = "#0ea5e9";
    
    if (type === "rain") {
      yTitle = "Precipitation (mm)";
      mainColor = "#10b981";
      subColor = "#38bdf8";
    } else if (type === "temp") {
      yTitle = `Temperature (${state.unit === "metric" ? "°C" : "°F"})`;
      mainColor = "#f59e0b";
      subColor = "#ef4444";
    } else if (type === "humid") {
      yTitle = "Relative Humidity (%)";
      mainColor = "#0ea5e9";
      subColor = "#a855f7";
    }

    myChart.data.datasets[0].data = data;
    myChart.data.datasets[1].data = data.map(val => Math.round(val * (0.92 + Math.random() * 0.16)));
    myChart.data.datasets[0].borderColor = mainColor;
    myChart.data.datasets[0].pointBackgroundColor = mainColor;
    myChart.data.datasets[0].backgroundColor = mainColor + "15";
    myChart.data.datasets[1].borderColor = subColor;
    myChart.data.datasets[1].pointBackgroundColor = subColor;

    myChart.options.scales.y.title.text = yTitle;
    
    const textColor = state.theme === "dark" ? "#a3b8ad" : "#4a6657";
    myChart.options.plugins.legend.labels.color = textColor;
    myChart.options.scales.x.ticks.color = textColor;
    myChart.options.scales.y.ticks.color = textColor;
    
    const gridColor = state.theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(16,185,129,0.08)";
    myChart.options.scales.x.grid.color = gridColor;
    myChart.options.scales.y.grid.color = gridColor;

    myChart.update();
  }

  // ==========================================================================
  // LEAFLET MAP INTEGRATION
  // ==========================================================================
  function initMap() {
    const region = regionalData[state.region];
    
    myMap = L.map("env-map", {
      center: region.coords,
      zoom: 11,
      zoomControl: true
    });

    updateMapBaseLayer();

    document.getElementById("map-layer-default").addEventListener("click", () => setMapOverlay("default"));
    document.getElementById("map-layer-ndvi").addEventListener("click", () => setMapOverlay("ndvi"));
    document.getElementById("map-layer-moisture").addEventListener("click", () => setMapOverlay("moisture"));
    document.getElementById("map-layer-temp").addEventListener("click", () => setMapOverlay("temp"));

    updateMapPosition();
  }

  function updateMapBaseLayer() {
    const tileUrl = state.theme === "dark" 
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
      
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    
    myMap.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        myMap.removeLayer(layer);
      }
    });

    L.tileLayer(tileUrl, { attribution, maxZoom: 20 }).addTo(myMap);
  }

  function updateMapPosition() {
    if (!myMap) return;
    const region = regionalData[state.region];
    myMap.setView(region.coords, 12);

    mapMarkers.forEach(m => myMap.removeLayer(m));
    mapMarkers = [];

    const offsetCoords = [
      [0, 0, "Central Core Gateway Hub", "NDVI: High | Soil Moisture: 44%"],
      [0.015, -0.02, "North Sector IoT Node", "Temps normal | Sprinkler relay standby"],
      [-0.02, 0.025, "South Sector Weather Node", "Alert: Wind speeds rising to 28km/h"]
    ];

    offsetCoords.forEach(offset => {
      const lat = region.coords[0] + offset[0];
      const lng = region.coords[1] + offset[1];
      
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: var(--primary-color); border: 2px solid #fff; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(myMap);
      marker.bindPopup(`
        <div style="padding: 2px;">
          <h4>${offset[2]}</h4>
          <p>${offset[3]}</p>
          <p style="font-size: 0.7rem; color: var(--text-muted); margin-top: 5px;">Coords: ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
        </div>
      `);
      mapMarkers.push(marker);
    });

    if (state.activeMapLayer !== "default") {
      setMapOverlay(state.activeMapLayer);
    }
  }

  function setMapOverlay(layerType) {
    state.activeMapLayer = layerType;
    
    mapOverlays.forEach(o => myMap.removeLayer(o));
    mapOverlays = [];

    document.querySelectorAll(".map-layer-btn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`map-layer-${layerType}`).classList.add("active");

    const legendTitle = document.getElementById("legend-title");
    const legendScale = document.getElementById("legend-scale-container");

    if (layerType === "default") {
      legendTitle.innerText = "Standard Map";
      legendScale.innerHTML = `<span class="legend-scale-text">Regional farm units and sensor hubs are indicated as icons. Click icons to read current sensor telemetry.</span>`;
      return;
    }

    const center = regionalData[state.region].coords;
    const gridRows = 8;
    const gridCols = 8;
    const step = 0.008;

    let gradientClass = "";
    let lowLabel = "";
    let highLabel = "";

    if (layerType === "ndvi") {
      legendTitle.innerText = "Canopy NDVI Overlay";
      gradientClass = "ndvi-grad";
      lowLabel = "0.2 (Arid/Bare)";
      highLabel = "1.0 (Dense Biomass)";
    } else if (layerType === "moisture") {
      legendTitle.innerText = "Soil Moisture Overlay";
      gradientClass = "moisture-grad";
      lowLabel = "10% (Critical Dry)";
      highLabel = "80% (Saturated)";
    } else if (layerType === "temp") {
      legendTitle.innerText = "Canopy Thermal Overlay";
      gradientClass = "temp-grad";
      lowLabel = "15°C (Cool)";
      highLabel = "45°C (Extreme Heat)";
    }

    legendScale.innerHTML = `
      <div class="legend-gradient-bar ${gradientClass}"></div>
      <div class="scale-labels">
        <span>${lowLabel}</span>
        <span>${highLabel}</span>
      </div>
    `;

    const startLat = center[0] - (gridRows/2) * step;
    const startLng = center[1] - (gridCols/2) * step;

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const cellLat = startLat + r * step;
        const cellLng = startLng + c * step;
        
        const bounds = [
          [cellLat, cellLng],
          [cellLat + step, cellLng + step]
        ];

        let color = "#10b981";
        let fillOpacity = 0.35;

        const distanceVal = Math.sqrt(Math.pow(r - gridRows/2, 2) + Math.pow(c - gridCols/2, 2));
        const noiseFactor = (Math.sin(r * 1.5) + Math.cos(c * 1.5)) / 4;
        const heatVal = Math.max(0, Math.min(1, (1 - (distanceVal / (gridRows * 0.7))) + noiseFactor));

        if (layerType === "ndvi") {
          if (heatVal < 0.3) color = "#b45309";
          else if (heatVal < 0.5) color = "#eab308";
          else if (heatVal < 0.85) color = "#22c55e";
          else color = "#15803d";
        } else if (layerType === "moisture") {
          if (heatVal < 0.3) color = "#f59e0b";
          else if (heatVal < 0.6) color = "#38bdf8";
          else color = "#1d4ed8";
        } else if (layerType === "temp") {
          const regionalHeatModifier = state.region === "andalusia" ? 0.2 : 0;
          const adjustedHeat = Math.min(1, heatVal + regionalHeatModifier);
          
          if (adjustedHeat < 0.3) color = "#1d4ed8";
          else if (adjustedHeat < 0.55) color = "#38bdf8";
          else if (adjustedHeat < 0.8) color = "#eab308";
          else color = "#ef4444";
        }

        const rect = L.rectangle(bounds, {
          color: "transparent",
          fillColor: color,
          fillOpacity: fillOpacity,
          weight: 0
        }).addTo(myMap);

        let telemetryLabel = "";
        if (layerType === "ndvi") telemetryLabel = `NDVI Index: ${(0.2 + heatVal * 0.8).toFixed(2)}`;
        else if (layerType === "moisture") telemetryLabel = `Soil Saturation: ${(15 + heatVal * 65).toFixed(1)}%`;
        else if (layerType === "temp") telemetryLabel = `Canopy Temperature: ${(16 + heatVal * 26).toFixed(1)}°C`;

        rect.bindTooltip(telemetryLabel, { sticky: true, opacity: 0.9 });
        mapOverlays.push(rect);
      }
    }
  }

  // ==========================================================================
  // CROP AI RECOMMENDATION LOGIC
  // ==========================================================================
  function runCropRecommendation() {
    const soil = document.getElementById("soil-type-select").value;
    const temp = parseFloat(document.getElementById("temp-input").value);
    const rain = parseFloat(document.getElementById("rainfall-input").value);

    const resultsList = document.getElementById("crop-recommendations-list");
    resultsList.innerHTML = `
      <div class="results-placeholder">
        <i class="fa-solid fa-spinner fa-spin" style="color: var(--primary-color);"></i>
        <p>AI analyzing soil parameters and moisture values...</p>
      </div>
    `;

    setTimeout(() => {
      const recommendations = calculateRecommendations(soil, temp, rain);
      
      resultsList.innerHTML = "";
      if (recommendations.length === 0) {
        resultsList.innerHTML = `
          <div class="results-placeholder">
            <i class="fa-solid fa-circle-xmark"></i>
            <p>No optimal crops found matching these extreme settings. Try modifying moisture or temperature inputs.</p>
          </div>
        `;
        return;
      }

      recommendations.forEach(crop => {
        resultsList.innerHTML += `
          <div class="crop-match-card">
            <div class="crop-info-col">
              <div class="crop-icon-bubble">
                <i class="fa-solid ${crop.icon}"></i>
              </div>
              <div>
                <span class="crop-name">${crop.name}</span>
                <span class="crop-type-label">${crop.class} • Sowing depth: ${crop.depth}</span>
              </div>
            </div>
            <div class="crop-gauge-col">
              <span class="crop-score-label">${crop.match}% Match</span>
              <div class="crop-gauge-bar-bg">
                <div class="crop-gauge-bar" style="width: ${crop.match}%;"></div>
              </div>
            </div>
          </div>
        `;
      });
    }, 800);
  }

  function calculateRecommendations(soil, temp, rain) {
    const cropPool = [
      { name: "Basmati Rice", class: "Cereal Grain", icon: "fa-seedling", soil: ["loamy", "clayey", "alluvial"], tempRange: [22, 35], rainRange: [1000, 2500], depth: "3cm" },
      { name: "Durum Wheat", class: "Winter Cereal", icon: "fa-wheat-awn", soil: ["loamy", "clayey", "alluvial", "black"], tempRange: [10, 25], rainRange: [400, 900], depth: "4cm" },
      { name: "Maize (Corn)", class: "Fodder & Grain", icon: "fa-wheat-awn", soil: ["loamy", "alluvial", "black"], tempRange: [18, 30], rainRange: [600, 1200], depth: "5cm" },
      { name: "Egyptian Cotton", class: "Cash Fibre", icon: "fa-leaf", soil: ["alluvial", "black", "loamy"], tempRange: [22, 38], rainRange: [300, 800], depth: "3cm" },
      { name: "Picual Olives", class: "Stone Fruit Trees", icon: "fa-leaf", soil: ["sandy", "loamy", "clayey"], tempRange: [15, 38], rainRange: [250, 600], depth: "Transplant" },
      { name: "Pearl Millet (Bajra)", class: "Dryland Grain", icon: "fa-seedling", soil: ["sandy", "loamy"], tempRange: [25, 42], rainRange: [150, 500], depth: "2.5cm" },
      { name: "Soybean", class: "Legume / Oilseed", icon: "fa-seedling", soil: ["loamy", "clayey", "black"], tempRange: [20, 32], rainRange: [700, 1300], depth: "4cm" },
      { name: "Sorghum", class: "Coarse Millet", icon: "fa-wheat-awn", soil: ["clayey", "sandy", "loamy", "black"], tempRange: [22, 38], rainRange: [300, 750], depth: "3cm" },
      { name: "Chickpeas (Garbanzo)", class: "Pulses", icon: "fa-seedling", soil: ["loamy", "black", "clayey"], tempRange: [15, 28], rainRange: [350, 600], depth: "5cm" }
    ];

    const results = [];

    cropPool.forEach(crop => {
      let matchScore = 0;
      
      if (crop.soil.includes(soil)) {
        matchScore += 40;
      } else {
        matchScore += 10;
      }

      if (temp >= crop.tempRange[0] && temp <= crop.tempRange[1]) {
        matchScore += 30;
      } else {
        const diff = Math.min(Math.abs(temp - crop.tempRange[0]), Math.abs(temp - crop.tempRange[1]));
        const penalty = Math.max(0, 30 - (diff * 4));
        matchScore += Math.round(penalty);
      }

      if (rain >= crop.rainRange[0] && rain <= crop.rainRange[1]) {
        matchScore += 30;
      } else {
        const diff = Math.min(Math.abs(rain - crop.rainRange[0]), Math.abs(rain - crop.rainRange[1]));
        const penalty = Math.max(0, 30 - (diff * 0.05));
        matchScore += Math.round(penalty);
      }

      if (matchScore >= 60) {
        results.push({
          name: crop.name,
          class: crop.class,
          icon: crop.icon,
          depth: crop.depth,
          match: matchScore
        });
      }
    });

    return results.sort((a, b) => b.match - a.match).slice(0, 3);
  }

  // ==========================================================================
  // AI PLANT DOCTOR LOGIC & DIAGNOSIS
  // ==========================================================================
  function generateLeafSVG(type) {
    let pathContent = "";
    
    if (type === "healthy") {
      pathContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
          <rect width="100%" height="100%" fill="rgba(16, 185, 129, 0.05)"/>
          <path d="M100,20 C140,80 160,110 100,180 C40,110 60,80 100,20 Z" fill="#10b981" stroke="#047857" stroke-width="3"/>
          <path d="M100,20 L100,180" stroke="#047857" stroke-width="2" stroke-dasharray="1 1"/>
          <path d="M100,60 Q120,50 135,45 M100,90 Q130,80 145,75 M100,120 Q125,115 135,115" stroke="#047857" stroke-width="1.5"/>
          <path d="M100,60 Q80,50 65,45 M100,90 Q70,80 55,75 M100,120 Q75,115 65,115" stroke="#047857" stroke-width="1.5"/>
        </svg>
      `;
    } else if (type === "blight") {
      pathContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
          <rect width="100%" height="100%" fill="rgba(245, 158, 11, 0.05)"/>
          <path d="M100,20 C140,80 160,110 100,180 C40,110 60,80 100,20 Z" fill="#65a30d" stroke="#4d7c0f" stroke-width="3"/>
          <path d="M100,20 L100,180" stroke="#4d7c0f" stroke-width="2"/>
          <circle cx="85" cy="70" r="10" fill="#78350f" stroke="#eab308" stroke-width="2"/>
          <circle cx="85" cy="70" r="5" fill="#451a03"/>
          <circle cx="120" cy="110" r="14" fill="#78350f" stroke="#eab308" stroke-width="3"/>
          <circle cx="120" cy="110" r="8" fill="#451a03"/>
          <circle cx="120" cy="110" r="3" fill="#000"/>
          <path d="M100,20 C110,40 120,60 125,75" stroke="#f59e0b" stroke-width="4" fill="none"/>
          <path d="M75,145 C85,160 95,170 100,180" stroke="#eab308" stroke-width="4" fill="none"/>
        </svg>
      `;
    } else if (type === "rust") {
      pathContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
          <rect width="100%" height="100%" fill="rgba(239, 68, 68, 0.05)"/>
          <path d="M100,10 C120,60 120,140 100,190 C80,140 80,60 100,10 Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="3"/>
          <path d="M100,10 L100,190" stroke="#4d7c0f" stroke-width="1.5"/>
          <circle cx="95" cy="50" r="3" fill="#ea580c" stroke="#b45309" stroke-width="1"/>
          <circle cx="105" cy="65" r="4" fill="#d97706" stroke="#b45309" stroke-width="1"/>
          <circle cx="92" cy="90" r="3" fill="#ea580c"/>
          <circle cx="106" cy="100" r="5" fill="#ea580c" stroke="#9a3412" stroke-width="1.5"/>
          <circle cx="95" cy="120" r="3" fill="#ea580c"/>
          <circle cx="101" cy="140" r="4" fill="#d97706"/>
          <circle cx="93" cy="155" r="2.5" fill="#9a3412"/>
        </svg>
      `;
    }
    return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(pathContent)));
  }

  function setupPlantDoctorActions() {
    const uploadInput = document.getElementById("leaf-image-upload");
    const dragArea = document.getElementById("drag-drop-zone");
    const defaultState = document.getElementById("upload-state-default");
    const previewState = document.getElementById("upload-state-preview");
    const previewImg = document.getElementById("leaf-preview-img");
    const removeBtn = document.getElementById("btn-remove-preview");
    const analyzeBtn = document.getElementById("btn-analyze-leaf");
    
    const cameraBtn = document.getElementById("camera-capture-btn");
    const cameraStreamContainer = document.getElementById("camera-stream-container");
    const cameraVideo = document.getElementById("camera-stream");
    const shutterBtn = document.getElementById("camera-capture-shutter-btn");

    dragArea.addEventListener("click", (e) => {
      if (e.target.closest("#btn-remove-preview") || 
          e.target.closest("#camera-stream-container") ||
          e.target.closest(".laser-beam") ||
          state.isScanning) {
        return;
      }
      uploadInput.click();
    });

    ["dragenter", "dragover"].forEach(eventName => {
      dragArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragArea.classList.add("dragover");
      }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
      dragArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragArea.classList.remove("dragover");
      }, false);
    });

    dragArea.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        handleImageFile(files[0]);
      }
    });

    uploadInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        handleImageFile(e.target.files[0]);
      }
    });

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      resetPlantDoctorUpload();
    });

    document.getElementById("sample-leaf-healthy").addEventListener("click", () => loadSampleLeaf("healthy"));
    document.getElementById("sample-leaf-blight").addEventListener("click", () => loadSampleLeaf("blight"));
    document.getElementById("sample-leaf-rust").addEventListener("click", () => loadSampleLeaf("rust"));

    cameraBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (state.cameraStream) {
        stopCamera();
      } else {
        startCamera();
      }
    });

    shutterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      captureCameraPhoto();
    });

    analyzeBtn.addEventListener("click", () => {
      runLeafAnalysis();
    });

    document.getElementById("tab-organic").addEventListener("click", () => switchTreatmentTab("organic"));
    document.getElementById("tab-chemical").addEventListener("click", () => switchTreatmentTab("chemical"));
    document.getElementById("tab-irrigation").addEventListener("click", () => switchTreatmentTab("irrigation"));
    document.getElementById("tab-prevention").addEventListener("click", () => switchTreatmentTab("prevention"));
  }

  function handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const previewImg = document.getElementById("leaf-preview-img");
      const defaultState = document.getElementById("upload-state-default");
      const previewState = document.getElementById("upload-state-preview");
      const analyzeBtn = document.getElementById("btn-analyze-leaf");

      stopCamera();

      previewImg.src = e.target.result;
      defaultState.classList.add("hidden");
      previewState.classList.remove("hidden");
      analyzeBtn.classList.remove("hidden");

      const name = file.name.toLowerCase();
      if (name.includes("blight")) state.currentDiseaseResult = "blight";
      else if (name.includes("rust")) state.currentDiseaseResult = "rust";
      else if (name.includes("spot")) state.currentDiseaseResult = "leaf_spot";
      else if (name.includes("mildew")) state.currentDiseaseResult = "mildew";
      else if (name.includes("wilt")) state.currentDiseaseResult = "wilt";
      else if (name.includes("healthy")) state.currentDiseaseResult = "healthy";
      else {
        const keys = ["blight", "rust", "leaf_spot", "mildew", "wilt"];
        state.currentDiseaseResult = keys[Math.floor(Math.random() * keys.length)];
      }
    };
    reader.readAsDataURL(file);
  }

  function loadSampleLeaf(type) {
    const previewImg = document.getElementById("leaf-preview-img");
    const defaultState = document.getElementById("upload-state-default");
    const previewState = document.getElementById("upload-state-preview");
    const analyzeBtn = document.getElementById("btn-analyze-leaf");

    stopCamera();

    previewImg.src = generateLeafSVG(type);
    
    document.querySelectorAll(".sample-leaf-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`sample-leaf-${type}`);
    if (activeBtn) activeBtn.classList.add("active");

    defaultState.classList.add("hidden");
    previewState.classList.remove("hidden");
    analyzeBtn.classList.remove("hidden");

    state.currentDiseaseResult = type;
    
    runLeafAnalysis();
  }

  function startCamera() {
    const defaultState = document.getElementById("upload-state-default");
    const previewState = document.getElementById("upload-state-preview");
    const cameraStreamContainer = document.getElementById("camera-stream-container");
    const cameraVideo = document.getElementById("camera-stream");
    const cameraBtn = document.getElementById("camera-capture-btn");
    const cameraBtnText = document.getElementById("camera-btn-text");

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        state.cameraStream = stream;
        cameraVideo.srcObject = stream;
        
        defaultState.classList.add("hidden");
        previewState.classList.add("hidden");
        cameraStreamContainer.classList.remove("hidden");
        
        cameraBtnText.innerText = "Close Camera";
        cameraBtn.classList.add("btn-secondary");
      })
      .catch(err => {
        console.error("Camera access failed:", err);
        alert("Camera permission denied or not supported on this device. Please upload an image instead.");
      });
  }

  function stopCamera() {
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(track => track.stop());
      state.cameraStream = null;
    }
    
    document.getElementById("camera-stream-container").classList.add("hidden");
    document.getElementById("camera-capture-btn").classList.remove("btn-secondary");
    document.getElementById("camera-btn-text").innerText = "Open Camera";
  }

  function captureCameraPhoto() {
    const video = document.getElementById("camera-stream");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL("image/jpeg");
    stopCamera();

    const previewImg = document.getElementById("leaf-preview-img");
    const defaultState = document.getElementById("upload-state-default");
    const previewState = document.getElementById("upload-state-preview");
    const analyzeBtn = document.getElementById("btn-analyze-leaf");

    previewImg.src = dataUrl;
    defaultState.classList.add("hidden");
    previewState.classList.remove("hidden");
    analyzeBtn.classList.remove("hidden");

    const keys = ["blight", "rust", "leaf_spot", "mildew", "wilt"];
    state.currentDiseaseResult = keys[Math.floor(Math.random() * keys.length)];
  }

  function resetPlantDoctorUpload() {
    stopCamera();
    document.getElementById("leaf-image-upload").value = "";
    document.getElementById("upload-state-default").classList.remove("hidden");
    document.getElementById("upload-state-preview").classList.add("hidden");
    document.getElementById("btn-analyze-leaf").classList.add("hidden");
    
    document.querySelectorAll(".sample-leaf-btn").forEach(btn => btn.classList.remove("active"));
    
    document.getElementById("doctor-results-placeholder").classList.remove("hidden");
    document.getElementById("doctor-results-card").classList.add("hidden");
    
    state.currentDiseaseResult = null;
  }

  function runLeafAnalysis() {
    if (!state.currentDiseaseResult || state.isScanning) return;
    
    state.isScanning = true;
    
    const scanOverlay = document.getElementById("leaf-scan-overlay");
    scanOverlay.classList.remove("hidden");

    const placeholder = document.getElementById("doctor-results-placeholder");
    const resultsCard = document.getElementById("doctor-results-card");
    
    resultsCard.classList.add("hidden");
    placeholder.classList.remove("hidden");
    placeholder.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin" style="color: var(--primary-color);"></i>
      <h4>AI Computer Vision active</h4>
      <p>Running multi-layer texture scan and lesion pattern matching...</p>
    `;

    setTimeout(() => {
      state.isScanning = false;
      scanOverlay.classList.add("hidden");
      
      const disease = plantDiseases[state.currentDiseaseResult];
      
      document.getElementById("disease-name").innerText = disease.name;
      document.getElementById("disease-confidence").innerText = `${disease.confidence}%`;
      
      const severityBadge = document.getElementById("disease-severity");
      severityBadge.innerText = disease.severity;
      severityBadge.className = `severity-badge ${disease.class}`;
      
      document.getElementById("disease-description").innerText = disease.description;
      document.getElementById("disease-causes").innerText = disease.causes;
      
      placeholder.classList.add("hidden");
      resultsCard.classList.remove("hidden");
      
      switchTreatmentTab("organic");

      if (disease.severity === "High Risk") {
        appendBotMessage(`🚨 Warning: AI Plant Doctor identified **${disease.name}** with ${disease.confidence}% confidence. I highly recommend checking the organic or chemical treatment tabs to quarantine this section immediately!`);
      }
    }, 2500);
  }

  function switchTreatmentTab(tab) {
    state.activeTreatmentTab = tab;
    
    document.querySelectorAll(".treatment-tab-btn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`tab-${tab}`).classList.add("active");
    
    const contentBox = document.getElementById("treatment-content-box");
    const disease = plantDiseases[state.currentDiseaseResult];
    
    if (!disease) return;

    let items = [];
    if (tab === "organic") items = disease.organic;
    else if (tab === "chemical") items = disease.chemical;
    else if (tab === "irrigation") items = disease.irrigation;
    else if (tab === "prevention") items = disease.prevention;

    let html = "<ul>";
    items.forEach(li => {
      html += `<li><i class="fa-solid fa-circle-chevron-right" style="color: var(--primary-color); margin-right: 8px;"></i>${li}</li>`;
    });
    html += "</ul>";
    
    contentBox.innerHTML = html;
  }

  // ==========================================================================
  // AI ASSISTANT CHATBOT
  // ==========================================================================
  function setupChatbot() {
    const toggle = document.getElementById("chatbot-toggle");
    const box = document.getElementById("chatbot-box");
    const closeBtn = document.getElementById("chatbot-close-btn");
    const form = document.getElementById("chatbot-form");
    const input = document.getElementById("chatbot-input");
    const pulseDot = document.querySelector(".chatbot-pulse-dot");

    toggle.addEventListener("click", () => {
      box.classList.toggle("hidden");
      pulseDot.classList.add("hidden");
      
      if (!box.classList.contains("hidden")) {
        input.focus();
      }
    });

    closeBtn.addEventListener("click", () => {
      box.classList.add("hidden");
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (text === "") return;
      
      handleUserChatMessage(text);
      input.value = "";
    });

    document.getElementById("chip-pest").addEventListener("click", (e) => {
      handleUserChatMessage(e.target.innerText);
    });
    document.getElementById("chip-irrigate").addEventListener("click", (e) => {
      handleUserChatMessage(e.target.innerText);
    });
    document.getElementById("chip-soil").addEventListener("click", (e) => {
      handleUserChatMessage(e.target.innerText);
    });
  }

  function handleUserChatMessage(msg) {
    appendUserMessage(msg);
    
    setTimeout(() => {
      const botResponse = getBotResponse(msg);
      appendBotMessage(botResponse);
    }, 600);
  }

  function appendUserMessage(msg) {
    const container = document.getElementById("chatbot-messages");
    container.innerHTML += `
      <div class="chat-msg msg-user">
        <div class="chat-msg-avatar"><i class="fa-solid fa-user"></i></div>
        <div class="chat-msg-bubble">${msg}</div>
      </div>
    `;
    scrollToBottom();
  }

  function appendBotMessage(msg) {
    const container = document.getElementById("chatbot-messages");
    container.innerHTML += `
      <div class="chat-msg msg-ai">
        <div class="chat-msg-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="chat-msg-bubble">${msg}</div>
      </div>
    `;
    scrollToBottom();
  }

  function scrollToBottom() {
    const container = document.getElementById("chatbot-messages");
    container.scrollTop = container.scrollHeight;
  }

  function getBotResponse(input) {
    const text = input.toLowerCase();

    if (text.includes("rust") || text.includes("foliar rust")) {
      return "🌾 Foliar Rust is a severe fungal contagion. For **Organic** treatment, apply copper-based fungicides immediately and destroy infected plant debris. For **Chemical** remedies, use triazole systemic fungicides (e.g. tebuconazole). Be sure to rotate crop varieties in coming seasons!";
    }
    
    if (text.includes("blight") || text.includes("alternaria")) {
      return "🍅 Early Blight causes concentric dark rings on bottom leaves. Apply liquid copper sprays organically, clip bottom leaves up to 12 inches high, and use straw mulch to block soil-borne splash vectors. Switch to drip lines rather than overhead watering.";
    }

    if (text.includes("wilt") || text.includes("wilted") || text.includes("ralstonia")) {
      return "🍂 Bacterial Wilt blocks xylem flow causing sudden leaf collapse. Unfortunately, systemic sprays are ineffective once structural wilt manifests. Quarantine the area, raise soil beds for optimized drainage, and treat soil for root-knot nematodes.";
    }

    if (text.includes("irrigate") || text.includes("water") || text.includes("cotton")) {
      return "💧 Cotton generally prefers deep irrigation intervals rather than constant watering. Keep soil saturation around 45-50%. If you're in the **Nile Delta** region, sustain current canal schedules but avoid waterlogging roots during early squaring.";
    }

    if (text.includes("sandy soil") || text.includes("sandy")) {
      return "🌱 Sandy soil drains water very quickly. Optimal crop recommendations include **Pearl Millet (Bajra)** and **Picual Olive trees**. If you add organic fertilizers, you can also support chickpeas, but avoid crops that demand high standing water like rice.";
    }

    if (text.includes("fertilizer") || text.includes("npk") || text.includes("urea")) {
      return "🧪 Fertilizer suggestion: Nitrogen-rich Urea is recommended in early morning, but check local winds! If wind speed exceeds 15 km/h (like in the **US Midwest** right now), drift will decrease application efficiency. Potassium sprays help crops fight drought stress.";
    }

    if (text.includes("weather") || text.includes("alert")) {
      const data = regionalData[state.region];
      return `🌤️ Currently in **${data.name}**: It is ${convertTemp(data.weather.temp)} with ${data.weather.condition}. Alert Status: **${data.alerts}**. Humidity is ${data.weather.humidity}%.`;
    }

    return "💡 I'm here to help with agricultural queries. You can ask me about dynamic crop matching, weather restrictions, leaf disease treatments (Rust, Blight, Wilt, Leaf Spot), or soil water requirements!";
  }

  // ==========================================================================
  // RUN SYSTEM
  // ==========================================================================
  init();

});
