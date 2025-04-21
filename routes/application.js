const db = require("../db/connetDB");
const express = require("express");
const { applicationEmailexist, applicationForm } = require("../Controller/controler");
const upload = require("../routes/uploading/fileupload");
const sendEmail = require('../helper/sendEmail');

const route = express.Router();

route.post(
    "/",
    upload.fields([
        { name: "waec_neco", maxCount: 1 },
        { name: "jamb_result", maxCount: 1 },
        { name: "transcript", maxCount: 1 },
        { name: "nysc", maxCount: 1 },
        { name: "hndcertificate", maxCount: 1 },
        { name: "affidavit", maxCount: 1 },
        { name: "masters_certificate", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            // Extract form fields (no required checks now)
            const {
                programme_of_interest, course_of_study, mode_of_study, preferred_university, email,
                subject1, grade1, subject2, grade2, subject3, grade3, subject4, grade4, subject5, grade5,
                jambrag_no, jamb_score, degree_title, name_of_university, year_of_graduation,
                achieved_grade, year_of_service, institution_name, topic
            } = req.body;

            if (!programme_of_interest || !course_of_study || !mode_of_study || !preferred_university || !email) {
                return res.status(409).json({ message: "Check if fileds is empty" });
            }

            // Check if email exists (if provided)
            if (email) {
                const user = await applicationEmailexist(email);
                if (user) {
                    return res.status(409).json({ message: "User with this email already exists" });
                }
            }

            // Handle file uploads (optional files)
            const requiredFiles = ["waec_neco", "jamb_result", "transcript", "nysc", "hndcertificate", "affidavit", "masters_certificate"];
            const uploadedFiles = requiredFiles.reduce((acc, field) => {
                acc[field] = req.files && req.files[field] ? req.files[field][0]?.path : null;  // Ensure file is present and retrieve its path
                return acc;
            }, {});

            // Save application to the database (skip missing fields)
            try {
                const saveApplication = await applicationForm(
                    programme_of_interest, course_of_study, mode_of_study, preferred_university, email,
                    subject1, grade1, subject2, grade2, subject3, grade3, subject4, grade4, subject5, grade5,
                    jambrag_no, jamb_score, degree_title, name_of_university, year_of_graduation,
                    achieved_grade, year_of_service, institution_name, topic,
                    uploadedFiles.transcript, uploadedFiles.hndcertificate, uploadedFiles.nysc,
                    uploadedFiles.waec_neco, uploadedFiles.affidavit, uploadedFiles.jamb_result,
                    uploadedFiles.masters_certificate
                );
                // Send the email before responding to the client
                const subjectEmail = 'Mail Verification';
                const content = `
                    <p>Hi,</p>
                    <p>Your application has been submitted successfully.</p>
                `;
                try {
                    await sendEmail(email, subjectEmail, content);  // Wait for the email to be sent
                } catch (emailError) {
                    console.error("Error sending email:", emailError);
                    // You can log or notify that the email failed
                }
                return res.status(201).json({
                    message: "Application submitted successfully",
                    data: saveApplication,
                });

            } catch (dbError) {
                console.error("Database error:", dbError);
                return res.status(500).json({ message: "Error saving application to the database.", error: dbError.message });
            }

        } catch (error) {
            console.error("Error submitting application:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
);

module.exports = route;
