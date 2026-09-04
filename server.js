import express from "express";
import multer from "multer";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const upload = multer();

app.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    const { dish } = req.body;
    const imageBuffer = req.file.buffer;

    const response = await axios.post(
      process.env.GROQ_ENDPOINT,
      imageBuffer,
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/octet-stream"
        }
      }
    );

    // Map Groq AI output to dish-specific metrics
    let result = {};
    if (dish === "chapati") {
      result = {
        diameter: response.data.diameter_cm,
        symmetry: response.data.symmetry_score,
        analysis: response.data.analysis_text
      };
    }
    if (dish === "dosa") {
      result = {
        radius: response.data.radius_cm,
        diameter: response.data.diameter_cm,
        area: response.data.area_cm2,
        perimeter: response.data.perimeter_cm,
        analysis: response.data.analysis_text
      };
    }
    if (dish === "appam") {
      result = {
        holes: response.data.hole_count,
        density: response.data.hole_density,
        analysis: response.data.analysis_text
      };
    }
    if (dish === "paratha") {
      result = {
        layers: response.data.layer_count,
        analysis: response.data.analysis_text
      };
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
