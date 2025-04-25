const db = require('../db/connetDB')
const bcrypt = require('bcryptjs');

//register student
async function Register(fullname, dob, gender, so, nationality, lga, address, number, email, password, passport) {
    const Emailexist = await emailExist(email);
    if (Emailexist) {
        throw new Error('Email Exist');
    }

    const query = "INSERT INTO std_table(fullname, dob, gender, so, nationality, lga, address, number, email, password, passport) VALUES(?,?,?,?,?,?,?,?,?,?,?)";

    try {
        const [result] = await db.execute(query, [fullname, dob, gender, so, nationality, lga, address, number, email, password, passport]);
        return {
            fullname,
            dob,
            gender,
            so,
            nationality,
            lga,
            address,
            number,
            email,
            passport
        }
    } catch (error) {
        console.error('Failed to insert:', error);
        throw new Error('Failed to insert');
    }
}


//application

async function applicationForm(
    programme_of_interest, course_of_study, mode_of_study, preferred_university, email,
    subject1, grade1, subject2, grade2, subject3, grade3, subject4, grade4, subject5, grade5,
    jambrag_no, jamb_score, degree_title, name_of_university, year_of_graduation,
    achieved_grade, year_of_service, institution_name, topic,
    transcript, hndcertificate, nysc, waec_neco, affidavit, jamb_result, masters_certificate
) {
    const query = `
        INSERT INTO application (
            programme_of_interest, course_of_study, mode_of_study, preferred_university, email,
            subject1, grade1, subject2, grade2, subject3, grade3, subject4, grade4, subject5, grade5,
            jambrag_no, jamb_score, degree_title, name_of_university, year_of_graduation,
            achieved_grade, year_of_service, institution_name, topic,
            transcript, hndcertificate, nysc, waec_neco, affidavit, jamb_result, masters_certificate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await db.execute(query, [
            programme_of_interest, course_of_study, mode_of_study, preferred_university, email,
            subject1, grade1, subject2, grade2, subject3, grade3, subject4, grade4, subject5, grade5,
            jambrag_no, jamb_score, degree_title, name_of_university, year_of_graduation,
            achieved_grade, year_of_service, institution_name, topic,
            transcript, hndcertificate, nysc, waec_neco, affidavit, jamb_result, masters_certificate
        ]);
        return result;
    } catch (error) {
        console.error("Database Insert Error:", error);
        throw new Error("Failed to insert application data into the database.");
    }
}

//check if email exist in applaiction table
async function applicationEmailexist(email) {

    const query = `
        SELECT application.*, std_table.* 
        FROM application
        LEFT JOIN std_table ON application.email = std_table.email
        WHERE application.email = ?;
    `;
    try {
        const [result] = await db.execute(query, [email]);

        // If the query returns no rows, return null
        if (result.length === 0) {
            return null;
        }

        // Return the first result if found
        return result[0];
    } catch (error) {
        // Log the error to help with debugging
        console.error("Error:", error);
        throw new Error('Database query failed'); // Rethrow the error to be handled in the route
    }
}


//check if user exist
// Check if email exists
async function emailExist(email) {
    const query = "SELECT * FROM std_table WHERE email=?";
    try {
        const [result] = await db.execute(query, [email]);
        return result.length > 0 ? result[0] : null; // return true if email exists, otherwise false
    } catch (error) {
        // console.error('cant find email', error)
        throw new Error('Cant find email');
    }
}
//get students
async function getUser(email) {
    const query = "SELECT * FROM std_table WHERE email = ?";
    try {
        const [result] = await db.execute(query, [email]);
        if (result.length === 0) {
            return null;  
        }
        return result[0];  
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Error fetching user details from the database');
    }
}

// Update user verification status
async function updateUser(is_verify, email) {
    const query = "UPDATE std_table SET is_verify=? WHERE email=?";
    try {
        const [result] = await db.execute(query, [is_verify, email]);
        return result;
    } catch (error) {
        console.error('Something went wrong:', error);
        throw new Error('Something went wrong');
    }
}

//get user buy token 

async function getUserByToken(token) {
    const query = "SELECT * FROM std_table WHERE is_verify=?";

    try {
        // Execute query with the token parameter
        const [result] = await db.execute(query, [token]);

        // If no user is found, return null
        if (result.length === 0) {
            return null;  // or throw an error if you prefer
        }

        return result[0]; // Return the first row (user)
    } catch (error) {
        console.error('Error fetching user by token:', error);
        throw new Error('Invalid token');
    }
}


//update token db
async function verifyEmail(email) {
    // Log the email before query to check if it's defined
    const query = "UPDATE std_table SET isVerified=true, is_verify=null WHERE email=?";
    try {
        const [result] = await db.execute(query, [email])
        return result.affectedRows > 0
    } catch (error) {
        console.error('Error updating email verification status:', error);
        throw error;

    }
}

//save payment
async function savePayment(email, amount, reference, purpose, status, channel) {
    // async function savePayment(email, amount, reference, purpose) {
    const query = "INSERT INTO payments(email, amount, reference, purpose,status,channel)VALUES(?,?,?,?,?,?)";
    try {
        const [result] = await db.execute(query, [email, amount, reference, purpose, status, channel])
        // const [result] = await db.execute(query, [email, amount, reference, purpose,status,bankname])
        return result
    } catch (error) {
        console.error('Error ocure:', error);
        throw error;
    }

}

async function getTransaction(email) {
    const query = "SELECT * FROM payments WHERE email=? ORDER BY date_time DESC";
    try {
        const [result] = await db.execute(query, [email])
        if (!result || result.length === 0) {
            return [];  // Return an empty array if no payments are found
        }

        return result;
    } catch (error) {
        console.error('Cant fine the email address')
        throw error
    }
}
async function changepassword(email, oldpassword, newpassword) {
    const queryuser = 'SELECT * FROM std_table WHERE email = ?';
    const [user] = await db.execute(queryuser, [email]);

    if (!user || user.length === 0) {
        throw new Error('User not found');
    }

    const match = await bcrypt.compare(oldpassword, user[0].password); // Comparing old password

    if (!match) {
        // Returning a custom message if old password doesn't match
        return { message: 'Old password is incorrect', success: false };
    }

    // Hash new password with 10 salt rounds
    const hashedNewPassword = await bcrypt.hash(newpassword, 10);

    // Update the password in the database
    const updateQuery = 'UPDATE std_table SET password = ? WHERE email = ?';
    await db.execute(updateQuery, [hashedNewPassword, email]);

    // Return success message when password change is successful
    return { message: 'Password successfully updated', success: true };
}

async function test(username, email, passport) {
    const q = "INSERT INTO test(username,email,pasport)VLAUES(?,?,?)"
    try {
        const [result] = await db.execute(q, [username, email, passport])
        return result
    } catch (error) {
        console.error('fial to insert',)
        throw error
    }
}

module.exports = { changepassword, getUser, Register, emailExist, updateUser, getUserByToken, verifyEmail, savePayment, applicationEmailexist, applicationForm, getTransaction, test }