const Resume = require("../models/Resume");

// Create a new resume
const createResume = async (req, res) => {
  try {
    const {
      title,
      template,
      personalInfo,
      education,
      experience,
      skills,
      projects,
    } = req.body;

    const resume = await Resume.create({
      user: req.userId,
      title: title || "My Resume",
      template: template || "Template1",
      personalInfo: personalInfo || {},
      education: education || [],
      experience: experience || [],
      skills: skills || [],
      projects: projects || [],
    });

    return res.status(201).json({
      success: true,
      message: "Resume created successfully",
      resume,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create resume",
      error: error.message,
    });
  }
};

// Get all resumes belonging to the logged-in user
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({
      user: req.userId,
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resumes",
      error: error.message,
    });
  }
};

// Get one resume belonging to the logged-in user
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;

    return res.status(status).json({
      success: false,
      message: "Failed to fetch resume",
      error: error.message,
    });
  }
};

// Update one resume belonging to the logged-in user
const updateResume = async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "template",
      "personalInfo",
      "education",
      "experience",
      "skills",
      "projects",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const resume = await Resume.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },

      { $set: updates },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      resume,
    });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;

    return res.status(status).json({
      success: false,
      message: "Failed to update resume",
      error: error.message,
    });
  }
};

// Delete one resume belonging to the logged-in user
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;

    return res.status(status).json({
      success: false,
      message: "Failed to delete resume",
      error: error.message,
    });
  }
};

module.exports = {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
};
