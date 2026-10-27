
const express = require("express");
const router = express.Router();

const {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume
} = require("../controllers/resume.controller");

const protect = require("../middleware/auth.middleware");

// Require authentication for all resume routes
router.use(protect);

router.post("/", createResume);
router.get("/", getResumes);
router.get("/:id", getResumeById);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);

module.exports = router;
