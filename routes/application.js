const express = require("express");
const { applicationEmailexist, applicationForm } = require("../Controller/controler");
const upload = require("../routes/uploading/fileupload");
const sendEmail = require('../helper/sendEmail');
const cloudinary = require('../utils/cloudinary');
const route = express.Router();

route.post("/", upload.fields([
    { name: 'waec_neco', maxCount: 1 },
    { name: 'jamb_result', maxCount: 1 },
    { name: 'transcript', maxCount: 1 },
    { name: 'nysc', maxCount: 1 },
    { name: 'hndcertificate', maxCount: 1 },
    { name: 'affidavit', maxCount: 1 },
    { name: 'masters_certificate', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            programme_of_interest, course_of_study, mode_of_study, preferred_university, email,
            subject1, grade1, subject2, grade2, subject3, grade3, subject4, grade4, subject5, grade5,
            jambrag_no, jamb_score, degree_title, name_of_university, year_of_graduation,
            achieved_grade, year_of_service, institution_name, topic
        } = req.body;

        if (!programme_of_interest || !course_of_study || !mode_of_study || !preferred_university || !email) {
            return res.status(409).json({ message: "Check if fields are empty" });
        }

        // Check if email exists (if provided)
        if (email) {
            const user = await applicationEmailexist(email);
            if (user) {
                return res.status(409).json({ message: "User with this email already exists" });
            }
        }

        const uploadedFiles = {};

        for (const field of [
            "waec_neco", "jamb_result", "transcript", "nysc", "hndcertificate", "affidavit", "masters_certificate"
        ]) {
            if (req.files && req.files[field]) {
                const filePath = req.files[field][0]?.path;
                try {
                    const cloudinaryUpload = await cloudinary.uploader.upload(filePath);
                    uploadedFiles[field] = cloudinaryUpload.secure_url;
                } catch (error) {
                    console.error(`Error uploading ${field} to Cloudinary:`, error);
                    uploadedFiles[field] = null;
                }
            } else {
                uploadedFiles[field] = null;
            }
        }

        // Save application to the database
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

            // Send email
            const subjectEmail = 'Mail Verification';
            const content = `
                <p>Hi,</p>
                <p>Your application has been submitted successfully.</p>
            `;
            try {
                await sendEmail(email, subjectEmail, content);  // Wait for the email to be sent
            } catch (emailError) {
                console.error("Error sending email:", emailError);
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
});

route.get("/", async (req, res) => {
    const {email} = req.body
    try {
        const student = await applicationEmailexist(email)
        if (!student) {
            return res.status(409).json({ message: "Student with this email cant be found" });
        }
        return res.status(200).json({ message: "User Student Exixt", data:student});
    } catch (error) {
        
    }
})
module.exports = route;

