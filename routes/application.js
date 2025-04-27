const express = require("express");
const { applicationEmailexist, applicationForm } = require("../Controller/controler");
const upload = require("../routes/uploading/fileupload");
const sendEmail = require('../helper/sendEmail');
const cloudinary = require('../utils/cloudinary');
const route = express.Router();
const uploadCloudinary = require('../utils/uploadCloudinary');

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

        // Validate essential fields
        if (!programme_of_interest || !course_of_study || !mode_of_study || !preferred_university || !email) {
            return res.status(409).json({ message: "Check if fields are empty" });
        }

        // Initialize an object to store the URLs for each file uploaded
        const uploadedFiles = {};

        // Array of possible file fields to check and upload
        const fileFields = [
            'waec_neco', 'jamb_result', 'transcript', 'nysc',
            'hndcertificate', 'affidavit', 'masters_certificate'
        ];

        try {
            // Iterate over each file field, upload to Cloudinary if provided
            for (let field of fileFields) {
                if (req.files[field] && req.files[field].length > 0) {
                    const file = req.files[field][0];
                    const cloudinaryUpload = await uploadCloudinary(file);
                    uploadedFiles[field] = cloudinaryUpload.secure_url; // Store only secure_url
                } else {
                    uploadedFiles[field] = null; // If file not uploaded, store null
                }
            }
        } catch (fileUploadError) {
            console.error("Error uploading files:", fileUploadError);
            return res.status(500).json({ message: "Error uploading files", error: fileUploadError.message });
        }

        // Insert application data into the database
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

            // Send confirmation email to the user
            const subjectEmail = 'Mail Verification';
            const content = `
                <p>Hi,</p>
                <p>Your application has been submitted successfully.</p>
            `;
            try {
                await sendEmail(email, subjectEmail, content); // Send the email
            } catch (emailError) {
                console.error("Error sending email:", emailError);
            }

            return res.status(201).json({
                message: "Application submitted successfully",
                data: saveApplication,
            });

        } catch (dbError) {
            console.error("Database error:", dbError);
            return res.status(500).json({ message: "Error,Application Filed to submit.", error: dbError.message });
        }

    } catch (error) {
        console.error("Error submitting application:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = route;
