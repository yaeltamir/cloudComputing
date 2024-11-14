const sql = require('mssql');
const userModel = require('../models/userModel'); // חיבור ל-Model שמטפל בבסיס הנתונים


// פונקציה שמטפלת בהרשמה ושולחת את הנתונים ל-Model
const registerUser = (req, res) => {
    // קבלת הנתונים מהטופס שנשלחו דרך ה-POST
    const { id, name, email, password, dob, gender,height, weight } = req.body;

    console.log('ID:', id); // הדפס את ה-ID כדי לבדוק אם הוא מגיע כראוי

    // יצירת אובייקט שמכיל את הנתונים שנקבל מהטופס
    const userData = {
        id: parseInt(id),
        name: name,
        email: email,
        password: password,
        birthday: dob,
        gender: gender,
        age: calculateAge(dob),
        height: parseFloat(height),
        weight: parseFloat(weight)
    };

    console.log('User Data:', userData);

    // שמירת הנתונים ב-Database באמצעות ה-Model
    userModel.saveUser(userData)
        .then(() => {
            res.send('User registered successfully!');
        })
        .catch((err) => {
            console.error('Error saving user:', err.message);
            res.status(500).send('Error registering user.'); // שגיאה כללית
        });
};

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    // אם יום הולדת עדיין לא עבר השנה, יש להפחית שנה אחת
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age;
}

const { authenticateUser } = require('../models/userModel');

// פונקציה שמטפלת בבקשה כאשר המשתמש לוחץ על כפתור ה-LOGIN
const loginUser = async (req, res) => {
    const { username, password } = req.body;//לבדוק שזה השמות הנכונים 

    // ביצוע אימות דרך המודל
    const result = await authenticateUser(username, password);
        // כאשר משתמש נכשל בהתחברות, נוודא שנחזיר errorMessage
        const errorMessage = result.success ? null : result.message;

    if (result.success) 
        {
        //      // שמירת פרטי המשתמש בסשן
        // req.session.user = {
        //     id: result.userData.id,
        //     password: result.userData.password,
        //     // כל שדה נוסף שתרצי לשמור
        //      };
        //      // הצגת session בלוגים כדי לבדוק
        //     console.log('Session after login:', req.session);
        req.session.user = result.userData;
        // אם האימות הצליח, נציג את דף הבית המותאם למשתמש
        res.redirect('home');
        
      } 
    else 
    {
        // אם האימות נכשל, נציג את דף הכניסה עם הודעת שגיאה
        res.render('index', { errorMessage: errorMessage || '' }); // ודא שהמשתנה קיים
    }
};


//module.exports = { registerUser, loginUser };

//Update user detail

const updateUser = (req, res) => {
    console.log('getUserDetails called2');
    const { id, name, email, password, dob, gender, age, height, weight } = req.body;

    // יצירת אובייקט שמכיל את הנתונים החדשים
    const updatedUserData = {
        id: parseInt(id),
        name: name,
        email: email,
        password: password,
        birthday: dob,
        gender: gender,
        age: parseInt(age),
        height: parseFloat(height),
        weight: parseFloat(weight)
    };

    console.log('Update Data:', updatedUserData);

    // עדכון הנתונים במסד הנתונים באמצעות המודל
    userModel.updateUser(updatedUserData)
        .then(() => {
            res.send('User updated successfully!');
        })
        .catch((err) => {
            console.error('Error updating user:', err.message);
            res.status(500).send('Error updating user.');
        });
};

// async function checkIfUserIsRegistered(idUser) {
//     const users = await userModel.fetchUserDataById(idUser);
//     return users[0].isRegistered

// }

const reverseSubscribtion=(req, res) => {
    const answer=req.params.answer

    const idUser=req.session.user.id
    console.log(answer);
 // const { id, name, email, password, dob, gender, age, height, weight } = req.body;

    // יצירת אובייקט שמכיל את הנתונים החדשים
    const updatedUserData = {
        id: parseInt(idUser),
        registeration:answer.toLowerCase() === "true"
    };

    //console.log('Update Data:', updatedUserData);

    // עדכון הנתונים במסד הנתונים באמצעות המודל
    userModel.subscribeToMessages(updatedUserData)
        .then(() => {
           console.log('User updated successfully!');
          // const isRegistered=checkIfUserIsRegistered(idUser)
  
           req.session.user.isRegistered=updatedUserData.registeration
            res.redirect('/messages');
        })
        .catch((err) => {
            console.error('Error updating user:', err.message);
            res.status(500).send('Error updating user.');
        });
};


// const getUserDetails = async (req, res) => {
//     console.log('getUserDetails called');
//     console.log('Session data:', req.session);
//     const { id, password } = req.session.user;
//     console.log(req.session.user);

//     try {
//         const result = await userModel.getUserByUsernameAndPassword(id, password);
//         console.log(result); // בדקי אם יש תוצאה ממסד הנתונים

//         if (!result) {
//             console.error('User not found or authentication failed');
//         }

//         if (result) {
//             // רנדר את התבנית עם פרטי המשתמש
//             res.render('updateDetails', { user: result });
//         } 
//         else {
//             res.status(401).json({ message: 'Authentication failed' });
//         }
//     } catch (err) {
//         console.error('Error fetching user details:', err.message);
//         res.status(500).send('Error fetching user details.');
//     }
// };



//module.exports = { registerUser, loginUser, updateUser, getUserDetails };


module.exports = { registerUser, loginUser, updateUser,reverseSubscribtion };
