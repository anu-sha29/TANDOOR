// --- LocalStorage Database ---
function saveAnalysis(dish, data) {
  let db = JSON.parse(localStorage.getItem("foodAnalysisDB")) || {};
  db[dish] = data;
  localStorage.setItem("foodAnalysisDB", JSON.stringify(db));
}
function loadAnalysis(dish) {
  let db = JSON.parse(localStorage.getItem("foodAnalysisDB")) || {};
  return db[dish] || null;
}

// --- Modal Controls ---
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("show");
    modal.style.display = "flex";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show");
    // add fade-out transition
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.style.display = "none";
      modal.style.opacity = "1";
      clearValues(modalId);
    }, 300); // match CSS transition duration
  }
}

// Close when clicking outside modal-content
window.addEventListener("click", function(event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    if (event.target === modal) closeModal(modal.id);
  });
});

// --- Clear Values ---
function clearValues(modalId) {
  const dish = modalId.replace("Modal", "").toLowerCase();
  if (dish === "chapati") {
    document.getElementById('chapatiDiameter').innerText = "";
    document.getElementById('chapatiSymmetry').innerText = "";
    document.getElementById('chapatiAnalysis').innerText = "";
  }
  if (dish === "paratha") {
    document.getElementById('parathaLayers').innerText = "";
    document.getElementById('parathaAnalysis').innerText = "";
  }
  if (dish === "appam") {
    document.getElementById('appamHoles').innerText = "";
    document.getElementById('appamDensity').innerText = "";
    document.getElementById('appamAnalysis').innerText = "";
  }
  if (dish === "dosa") {
    document.getElementById('dosaRadius').innerText = "";
    document.getElementById('dosaDiameter').innerText = "";
    document.getElementById('dosaArea').innerText = "";
    document.getElementById('dosaPerimeter').innerText = "";
    document.getElementById('dosaAnalysis').innerText = "";
  }
}

// --- Image Loader + AI Integration ---
async function processImage(event, canvasId, dish) {
  const file = event.target.files[0];
  if (!file) return;

  // Preview image on canvas
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.getElementById(canvasId);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  // Send to backend for AI analysis
  const formData = new FormData();
  formData.append("file", file);
  formData.append("dish", dish);

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      body: formData
    });
    const result = await response.json();

    // Dispatch to correct analyzer
    if (dish === "chapati") analyzeChapati(result);
    if (dish === "paratha") analyzeParatha(result);
    if (dish === "appam") analyzeAppam(result);
    if (dish === "dosa") analyzeDosa(result);
  } catch (err) {
    console.error("AI analysis failed", err);
  }
}

// --- Dish Analyzers (consume AI results) ---
function analyzeChapati(aiResult) {
  document.getElementById('chapatiDiameter').innerText = aiResult.diameter || "";
  document.getElementById('chapatiSymmetry').innerText = aiResult.symmetry || "";
  document.getElementById('chapatiAnalysis').innerText = aiResult.analysis || "";
  saveAnalysis("chapati", aiResult);
}
function analyzeParatha(aiResult) {
  document.getElementById('parathaLayers').innerText = aiResult.layers || "";
  document.getElementById('parathaAnalysis').innerText = aiResult.analysis || "";
  saveAnalysis("paratha", aiResult);
}
function analyzeAppam(aiResult) {
  document.getElementById('appamHoles').innerText = aiResult.holes || "";
  document.getElementById('appamDensity').innerText = aiResult.density || "";
  document.getElementById('appamAnalysis').innerText = aiResult.analysis || "";
  saveAnalysis("appam", aiResult);
}
function analyzeDosa(aiResult) {
  document.getElementById('dosaRadius').innerText = aiResult.radius || "";
  document.getElementById('dosaDiameter').innerText = aiResult.diameter || "";
  document.getElementById('dosaArea').innerText = aiResult.area || "";
  document.getElementById('dosaPerimeter').innerText = aiResult.perimeter || "";
  document.getElementById('dosaAnalysis').innerText = aiResult.analysis || "";
  saveAnalysis("dosa", aiResult);
}

