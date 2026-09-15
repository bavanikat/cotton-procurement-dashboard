import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [mandis, setMandis] = useState([]);
  const [prices, setPrices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [procurements, setProcurements] = useState([]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [userData, setUserData] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    quantity: "",
    quality: "Premium",
  });
 useEffect(() => {
  fetch("http://localhost:5000/api/mandis")
    .then((response) => response.json())
    .then((data) => {
      setMandis(data);
      console.log("Mandis from backend:", data);
    })
    .catch((error) => {
      console.log("Error fetching mandis:", error);
    });

  fetch("http://localhost:5000/api/prices")
    .then((response) => response.json())
    .then((data) => {
      setPrices(data);
      console.log("Prices from backend:", data);
    })
    .catch((error) => {
      console.log("Error fetching prices:", error);
    });

  fetch("http://localhost:5000/api/suppliers")
    .then((response) => response.json())
    .then((data) => {
      setSuppliers(data);
      console.log("Suppliers from backend:", data);
    })
    .catch((error) => {
      console.log("Error fetching suppliers:", error);
    });

  fetch("http://localhost:5000/api/procurements")
    .then((response) => response.json())
    .then((data) => {
      setProcurements(data);
      console.log("Procurements from backend:", data);
    })
    .catch((error) => {
      console.log("Error fetching procurements:", error);
    });

  fetch("http://localhost:5000/api/prediction")
    .then((response) => response.json())
    .then((data) => {
      setPrediction(data);
      console.log("Prediction from backend:", data);
    })
    .catch((error) => {
      console.log("Error fetching prediction:", error);
    });
}, []);
const recommendedPrice = prices.length
  ? prices.reduce((lowest, item) =>
      item.price < lowest.price ? item : lowest
    )
  : null;
const calculateScore = (price, quality, availability, distance) => {
  // Lower price is better
  const priceScore = Math.max(0, ((8000 - price) / 8000) * 40);

  // Higher quality is better
  const qualityScore = (quality / 100) * 25;

  // Higher availability is better
  const availabilityScore =
    Math.min(availability / 1000, 1) * 20;

  // Shorter distance is better
  const transportScore =
    Math.max(0, (100 - distance) / 100) * 15;

  return (
    priceScore +
    qualityScore +
    availabilityScore +
    transportScore
  );
};
 const transportData = {
  Erode: 0,
  Salem: 65,
  Tiruppur: 55,
  Coimbatore: 100,
  Karur: 75
};

const transportRate = 25; // ₹ per km per tonne
const latestMandiPrices = Object.values(
  prices.reduce((result, item) => {
    const mandiId = item.mandiId?._id;

    if (
      !result[mandiId] ||
      new Date(item.date) > new Date(result[mandiId].date)
    ) {
      result[mandiId] = item;
    }

    return result;
  }, {})
);
const mandiScores = latestMandiPrices.map((item) => {
  const supplier = suppliers.find(
    (s) => String(s.mandiId?._id) === String(item.mandiId?._id)
  );
  const distance = transportData[item.mandiId?.name] || 0;

const transportCost = distance * transportRate;

  const score = calculateScore(
  item.price,
  item.quality,
  supplier?.availability || 0,
  distance
);

 return {
  ...item,
  score,
  distance,
  transportCost
};
});

const bestMandi = mandiScores.length
  ? mandiScores.reduce((best, item) =>
      item.score > best.score ? item : best
    )
  : null;

const bestSupplier = bestMandi
  ? suppliers.find(
      (supplier) =>
        String(supplier.mandiId?._id) ===
        String(bestMandi.mandiId?._id)
    )
  : null;
  
 const quantity = Number(userData.quantity) || 0;

const recommendedCottonCost = bestMandi
  ? quantity * bestMandi.price
  : 0;

const recommendedTransportCost = bestMandi
  ? bestMandi.transportCost || 0
  : 0;

const recommendedTotalCost =
  recommendedCottonCost + recommendedTransportCost;
  const mandiTotalCosts = latestMandiPrices.map((item) => {
  const mandiData = mandiScores.find(
    (m) => String(m.mandiId?._id) === String(item.mandiId?._id)
  );

  const cottonCost = quantity * item.price;
  const transportCost = mandiData?.transportCost ?? 0;

  return cottonCost + transportCost;
});

const sortedCosts = [...mandiTotalCosts].sort((a, b) => a - b);

const alternativeCosts = sortedCosts.filter(
  (cost) => cost !== recommendedTotalCost
);

const nextBestCost =
  alternativeCosts.length > 0
    ? alternativeCosts[0]
    : recommendedTotalCost;

const estimatedSavings = Math.max(
  0,
  nextBestCost - recommendedTotalCost
);

 
  const erodeChartData = prices
  .filter((item) =>
    item.mandiId?.name?.toLowerCase().includes("erode")
  )
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(-7);

const chartPrices = erodeChartData.map((item) => item.price);

if (prediction) {
  chartPrices.push(prediction.predictedPrice);
}

const minPrice = chartPrices.length ? Math.min(...chartPrices) : 0;
const maxPrice = chartPrices.length ? Math.max(...chartPrices) : 1;

const getChartHeight = (price) => {
  if (maxPrice === minPrice) return 60;

  return 20 + ((price - minPrice) / (maxPrice - minPrice)) * 60;
};
  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
  e.preventDefault();

  if (!loginData.email || !loginData.password) {
    alert("Please enter Email and Password");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: loginData.email,
        password: loginData.password
      })
    });

    const data = await response.json();

    if (!response.ok && data.message !== "New user") {
  alert(data.message || "Invalid email or password");
  return;
}

   if (data._id) {
  setUserData({
    ...userData,
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    location: data.factoryLocation,
    quantity: data.quantity,
    quality: data.quality,
    userId: data._id
  });

  setPage("dashboard");
} else {
  setUserData({
    ...userData,
    email: loginData.email
  });

  setPage("userInfo");
}

  } catch (error) {
    console.error("Login error:", error);
    alert("Unable to connect to server");
  }
};
  // ---------------- USER INFO ----------------
  const handleUserSubmit = async (e) => {
  e.preventDefault();

  if (
    !userData.name ||
    !userData.company ||
    !userData.email ||
    !userData.phone ||
    !userData.location ||
    !userData.quantity
  ) {
    alert("Please fill all required fields");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: userData.name,
        company: userData.company,
        email: userData.email,
        password: loginData.password,
        phone: userData.phone,
        factoryLocation: userData.location,
        quantity: Number(userData.quantity),
       quality: userData.quality
      })
    });

    const savedUser = await response.json();

    if (!response.ok) {
  throw new Error(savedUser.error || savedUser.message || "Failed to save user");
}

    setUserData({
      ...userData,
      email: loginData.email,
      userId: savedUser._id
    });

    console.log("User saved successfully:", savedUser);

    setPage("dashboard");

  } catch (error) {
    console.error("Error saving user:", error);
   alert(error.message);
  }
};

  // ---------------- LOGIN PAGE ----------------
  if (page === "login") {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-logo">🌱</div>

          <h1>AI-Based Cotton Procurement</h1>
          <p className="login-subtitle">
            Smart Procurement Optimization Dashboard
          </p>

          <form onSubmit={handleLogin}>

            <label>Email / Username</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  email: e.target.value,
                })
              }
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  password: e.target.value,
                })
              }
            />

            <button className="primary-btn" type="submit">
              LOGIN
            </button>

          </form>

          <p className="login-note">
            Textile Industry Procurement Management System
          </p>

        </div>
      </div>
    );
  }

  // ---------------- USER INFORMATION PAGE ----------------
  if (page === "userInfo") {
    return (
      <div className="user-page">

        <div className="user-card">

          <div className="form-header">
            <div className="small-logo">🌱</div>
            <div>
              <h1>User Information</h1>
              <p>
                Enter your procurement requirements to continue
              </p>
            </div>
          </div>

          <form onSubmit={handleUserSubmit}>

            <div className="form-grid">

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={userData.company}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      company: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={userData.email}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={userData.phone}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Factory Location *</label>
                <input
                  type="text"
                  placeholder="Example: Tiruppur"
                  value={userData.location}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      location: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Required Cotton Quantity *</label>
                <input
                  type="number"
                  placeholder="Quantity in Quintals"
                  value={userData.quantity}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      quantity: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group full-width">
                <label>Required Cotton Quality</label>

                <select
                  value={userData.quality}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      quality: e.target.value,
                    })
                  }
                >
                  <option>Premium</option>
                  <option>Standard</option>
                  <option>Basic</option>
                </select>

              </div>

            </div>

            <div className="form-buttons">

              <button
                type="button"
                className="back-btn"
                onClick={() => setPage("login")}
              >
                ← Back
              </button>

              <button
                type="submit"
                className="primary-btn continue-btn"
              >
                Continue to Dashboard →
              </button>

            </div>

          </form>

        </div>
      </div>
    );
  }

  // ---------------- DASHBOARD ----------------
  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="top-header">

        <div className="brand">

          <div className="brand-logo">
            🌱
          </div>

          <div>
            <h2>AI-Based Cotton Procurement</h2>
            <span>Optimization Dashboard</span>
          </div>

        </div>

        <div className="header-right">

          <div className="status">
            <span className="status-dot"></span>
            Procurement Analysis Active
          </div>

          <button
            className="logout-btn"
            onClick={() => setPage("login")}
          >
            Logout
          </button>

        </div>

      </header>


      {/* MAIN */}
      <main className="dashboard-container">

        <div className="dashboard-title">

          <div>
            <p className="section-label">
              TEXTILE PROCUREMENT INTELLIGENCE
            </p>

            <h1>Smart Cotton Sourcing Dashboard</h1>

            <p className="description">
              Compare mandi price, quality, availability, logistics
              and procurement risk to identify the most suitable
              cotton source.
            </p>
          </div>

          <div className="analysis-status">
            <span>Analysis Status</span>
            <strong>Ready</strong>
          </div>

        </div>


        {/* USER REQUIREMENT */}
        <div className="user-requirement">

          <div>
            <span>Procurement User</span>
            <strong>{userData.name || "User"}</strong>
          </div>

          <div>
            <span>Company</span>
            <strong>{userData.company || "Textile Company"}</strong>
          </div>

          <div>
            <span>Factory Location</span>
            <strong>{userData.location || "Tiruppur"}</strong>
          </div>

          <div>
            <span>Required Quantity</span>
            <strong>{userData.quantity || "1000"} Quintals</strong>
          </div>
          <div>
  <span>Required Quality</span>
<strong>{userData.quality || "Premium"}</strong>
</div>
          <button
  type="button"
  className="primary-btn"
  onClick={() => setPage("userInfo")}
>
  ✏️ Edit Requirements
</button>

        </div>


        {/* KPI CARDS */}
        <div className="kpi-grid">

          <div className="kpi-card">
            <div className="kpi-icon blue">🏪</div>

            <div>
              <span>Total Mandis</span>
              <h2>{mandis.length}</h2>
              <small>Available for comparison</small>
            </div>
          </div>


          <div className="kpi-card">
            <div className="kpi-icon orange">₹</div>

            <div>
              <span>Average Cotton Price</span>
              <h2>
  ₹{prices.length
    ? Math.round(
        prices.reduce((sum, item) => sum + item.price, 0) / prices.length
      ).toLocaleString()
    : "0"}
</h2>
              <small>Per quintal</small>
            </div>
          </div>


          <div className="kpi-card">
            <div className="kpi-icon green">↓</div>

            <div>
              <span>Lowest Price</span>
              <h2>
  ₹{prices.length
    ? Math.min(...prices.map((item) => item.price)).toLocaleString()
    : "0"}
</h2>
              <small>Per quintal</small>
            </div>
          </div>


 <div className="kpi-card recommended">

  <div className="kpi-icon purple">🏆</div>

  <div>
    <span>Recommended Mandi</span>

    <h2>
      {bestMandi
        ? bestMandi.mandiId.name
        : "Loading..."}
    </h2>

    <small>
      Procurement Score:{" "}
      {bestMandi
        ? bestMandi.score.toFixed(1)
        : "0"}
    </small>

    {bestMandi && (
      <>
        <small>
          🚚 Distance: {bestMandi.distance ?? 0} km
        </small>

        <small>
          💰 Transport: ₹
          {(bestMandi?.transportCost ?? 0).toLocaleString()}
        </small>
      </>
    )}

  </div>

</div>


<div className="kpi-card">

  <div className="kpi-icon green">💰</div>

  <div>
    <span>Estimated Procurement Cost</span>

    <h2>
      ₹{recommendedTotalCost.toLocaleString()}
    </h2>

    <small>
      For {quantity || 0} quintals
    </small>
  </div>

</div>
<div className="kpi-card">

  <div className="kpi-icon green">📈</div>

  <div>
    <span>Estimated Savings</span>

    <h2>
      ₹{estimatedSavings.toLocaleString()}
    </h2>

    <small>
      Compared with alternative mandi
    </small>
  </div>

</div>
</div>   {/* CLOSE kpi-grid */}


{/* ANALYSIS SECTIONS */}
<div className="analysis-grid">

          {/* PRICE */}
          <div className="dashboard-card">

            <div className="card-heading">
              <div>
                <p>MARKET ANALYSIS</p>
                <h2>Mandi Price Comparison</h2>
              </div>

              <span className="unit">₹ / Quintal</span>
            </div>


            <div className="price-list">

  {latestMandiPrices.map((item) => {
  const mandiData = mandiScores.find(
    (m) => String(m.mandiId?._id) === String(item.mandiId?._id)
  );

  return (
    <div key={item._id} className="mandi-price-row">
      <PriceBar
        name={item.mandiId.name}
        price={`₹${item.price.toLocaleString()}`}
        width={`${(item.price / 8000) * 100}%`}
      />

      <small>
        🚚 Transport: ₹
        {(mandiData?.transportCost ?? 0).toLocaleString()}
      </small>
    </div>
  );
})}

</div>

          </div>


          {/* QUALITY */}
          <div className="dashboard-card">

            <div className="card-heading">

              <div>
                <p>COTTON QUALITY</p>
                <h2>Quality & Availability</h2>
              </div>

              <span className="unit">Score / 100</span>

            </div>


            {suppliers.map((supplier) => (
  <QualityBar
    key={supplier._id}
    name={supplier.mandiId.name}
    score={supplier.qualityScore}
    availability={`${supplier.availability} Q`}
    width={`${supplier.qualityScore}%`}
  />
))}

          </div>

        </div>
{/* =========================
    PRICE FORECAST SECTION
========================= */}

<div className="forecast-card">

  <div className="card-heading">

    <div>
      <p>AI PRICE FORECAST</p>
      <h2>Future Cotton Price & Best Buying Time</h2>
    </div>

    <span className="unit">Next 7 Days</span>

  </div>


  {/* FORECAST SUMMARY */}

  <div className="forecast-summary">

    <div className="forecast-box">

      <span>Current Price</span>

     <h3>
  ₹{prediction ? prediction.currentPrice.toLocaleString() : "0"}
</h3>

      <small>Per Quintal</small>

    </div>


    <div className="forecast-arrow">
      →
    </div>


    <div className="forecast-box predicted">

      <span>Predicted Price</span>

     <h3>
  ₹{prediction ? prediction.predictedPrice.toLocaleString() : "0"}
</h3>

      <small>After 7 Days</small>

    </div>


    <div className="forecast-box trend-box">

      <span>Expected Change</span>

      <h3>
  {prediction
    ? `+₹${prediction.change.toLocaleString()}`
    : "0"}
</h3>
     <small>
  {prediction ? `${prediction.percentage}% Increase` : "0%"}
</small>

    </div>

  </div>


  {/* PRICE TREND */}

  <div className="forecast-content">

    <div className="trend-section">

      <div className="trend-title">

        <div>
          <span>PRICE TREND</span>
          <h3>Erode Mandi – Historical & Forecast</h3>
        </div>

        <strong className="trend-up">
          ↗ Increasing
        </strong>

      </div>


      {/* SIMPLE CHART */}

      <div className="chart-area">

        <div className="chart-y-axis">

          <span>₹7,500</span>
          <span>₹7,400</span>
          <span>₹7,300</span>
          <span>₹7,200</span>
          <span>₹7,100</span>

        </div>


        <div className="chart">

        <div className="chart-line">
  {erodeChartData.map((item) => (
    <span
      key={item._id}
      style={{ height: `${getChartHeight(item.price)}%` }}
      title={`₹${item.price}`}
    ></span>
  ))}

  {prediction && (
    <span
      style={{
        height: `${getChartHeight(prediction.predictedPrice)}%`
      }}
      title={`Predicted: ₹${prediction.predictedPrice}`}
    ></span>
  )}
</div>


          <div className="chart-labels">
  {erodeChartData.map((item) => (
    <span key={item._id}>
      {new Date(item.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short"
      })}
    </span>
  ))}

  {prediction && <span>Forecast</span>}
</div>

        </div>

      </div>

    </div>


    {/* BUYING DECISION */}

    <div className="buying-decision">

      <div className="decision-icon">
        🟢
      </div>

      <div>

        <p>BUYING TIME RECOMMENDATION</p>

        <h2>
  {prediction
    ? prediction.predictedPrice > prediction.currentPrice
      ? "BUY NOW"
      : prediction.predictedPrice < prediction.currentPrice
      ? "WAIT"
      : "NO URGENT ACTION"
    : "ANALYZING..."}
</h2>

       <span>
  {prediction
    ? prediction.predictedPrice > prediction.currentPrice
      ? `Expected cotton price may increase from ₹${prediction.currentPrice.toLocaleString()} to ₹${prediction.predictedPrice.toLocaleString()} per quintal. Buying now may help reduce future procurement cost.`
      : prediction.predictedPrice < prediction.currentPrice
      ? `Expected cotton price may decrease from ₹${prediction.currentPrice.toLocaleString()} to ₹${prediction.predictedPrice.toLocaleString()} per quintal. Waiting may help reduce procurement cost.`
      : `Expected cotton price is likely to remain stable around ₹${prediction.currentPrice.toLocaleString()} per quintal.`
    : "Analyzing future cotton price..."}
</span>

      </div>

    </div>

  </div>


  {/* FORECAST NOTE */}

  <div className="forecast-note">

    <strong>Forecast Insight:</strong>

    Historical price trend indicates an increasing
    pattern. Purchasing at the current price may
    help reduce the expected future procurement cost.

  </div>

</div>

        {/* ROUTE SECTION */}
        <div className="dashboard-card route-card">

          <div className="card-heading">

            <div>
              <p>LOGISTICS ANALYSIS</p>
              <h2>Route & Transportation Analysis</h2>
            </div>

            <span className="unit">Cost Optimization</span>

          </div>


          <div className="route-flow">

            <div className="route-point">
              <div className="route-icon">🏭</div>
              <strong>{userData.location || "Tiruppur"}</strong>
              <span>Factory</span>
            </div>

            <div className="route-line">
              <span>{bestMandi?.distance ?? 0} km</span>
              <div></div>
              <small>🚚</small>
            </div>

            <div className="route-point">
              <div className="route-icon">🏪</div>
              <strong>
  {bestMandi ? bestMandi.mandiId.name : "Loading..."}
</strong>
              <span>Recommended Source</span>
            </div>

          </div>


          <div className="route-details">

            <div>
              <span>Distance</span>
              <strong>{bestMandi?.distance ?? 0} km</strong>
            </div>

            <div>
              <span>Transportation Cost</span>
             <strong>
₹{(bestMandi?.transportCost ?? 0).toLocaleString()}
</strong>
            </div>

            <div>
              <span>Cotton Price</span>
              <strong>
  ₹{bestMandi ? bestMandi.price.toLocaleString() : "0"}/Q
</strong>
            </div>

            <div>
              <span>Estimated Procurement Cost</span>
             <strong>
  ₹{recommendedTotalCost.toLocaleString()}
</strong>
            </div>

          </div>

        </div>


        {/* RECOMMENDATION */}
        <div className="recommendation-card">

          <div className="recommendation-icon">
            🏆
          </div>

          <div className="recommendation-content">

            <p>FINAL PROCUREMENT RECOMMENDATION</p>

            <h2>
              Recommended Mandi: <strong>
  {bestMandi ? bestMandi.mandiId.name : "Loading..."}
</strong>
            </h2>

            <p className="recommendation-text">
  {bestMandi
    ? `${bestMandi.mandiId.name} is selected based on a combined evaluation of cotton price, quality, availability, distance and transportation cost.`
    : "Evaluating the best mandi based on price, quality, availability, distance and transportation cost."}
</p>

            <div className="recommendation-values">

              <span>
              Price <strong>
  ₹{bestMandi ? bestMandi.price.toLocaleString() : "0"}/Q
</strong>
              </span>

              <span>
Quality <strong>
  {bestMandi ? bestMandi.quality : "0"}/100
</strong>             </span>

              <span>
                Availability <strong>
  {bestSupplier ? bestSupplier.availability : "0"} Q
</strong>
              </span>

              <span>
  Distance <strong>{bestMandi?.distance ?? 0} km</strong>
</span>

             <span>
  Transport <strong>₹{(bestMandi?.transportCost ?? 0).toLocaleString()}</strong>
</span>

              <span>
                Score <strong>
  {bestMandi ? bestMandi.score.toFixed(1) : "0"}/100
</strong>
              </span>

            </div>

          </div>

        </div>


        <footer>
          AI-Based Cotton Procurement Optimization Dashboard
        </footer>

      </main>

    </div>
  );
}


// ---------------- PRICE BAR COMPONENT ----------------

function PriceBar({ name, price, width }) {
  return (
    <div className="price-item">

      <div className="price-header">
        <span>{name}</span>
        <strong>{price}</strong>
      </div>

      <div className="bar-background">
        <div
          className="bar-fill"
          style={{ width: width }}
        ></div>
      </div>

    </div>
  );
}


// ---------------- QUALITY BAR COMPONENT ----------------

function QualityBar({ name, score, availability, width }) {
  return (
    <div className="quality-item">

      <div className="quality-header">
        <span>{name}</span>
        <strong>{score}/100</strong>
      </div>

      <div className="bar-background">
        <div
          className="quality-fill"
          style={{ width: width }}
        ></div>
      </div>

      <div className="availability">
        <span>Availability</span>
        <strong>{availability}</strong>
      </div>

    </div>
  );
}

export default App;