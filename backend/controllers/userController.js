const User = require('../models/User');
const bcrypt = require('bcrypt');
const bucket = require('../config/firebase');
const jwt = require('jsonwebtoken');

// JWT Token Generation Function
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '30d'
        }
    );
};


// Upload file to firebase storage
const uploadToFirebase = async (file,userId,fileType) => {
    try {
        if (!file) return null;
        const filename = `${userId}_${fileType}_${Date.now()}`;
        const fileBuffer = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ''), 'base64');

        const fileUpload = bucket.file(filename);
        await fileUpload.save(fileBuffer, {
            metadata: { contentType: 'image/jpeg' }
        });

        await fileUpload.makePublic();

        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        return fileUrl;
    }catch (error){
        console.error('Error uploading to Firebase:', error);
        throw new Error('Failed to upload file to storage');
    }
}

// User Controller
const userController = {
    // Register parent or teacher
    registerAdult: async (req,res)=> {
        try {
            const {fullName,email,password,role} = req.body;
            if (role !== 'parent' && role !=='teacher'){
                return res.status(400).json({
                    success:false,
                    message:'Invalid role.Must be parent or teacher.'
                });
            }
            // Check existing user
            const existingUser = await User.findOne({email});
            if (existingUser){
                return res.status(400).json({
                    success:false,
                    message:'User already exist'
                });
            }
            // Create New User
            const newUser =new User({
                fullName,
                email,
                password,
                role
            });

            await  newUser.save();

            const token = generateToken(newUser);
            res.status(201).json({
                success:true,
                message: `${role} Registered Successfully`,
                data:{
                    user:{
                        id:newUser._id,
                        fullName:newUser.fullName,
                        email:newUser.email,
                        role:newUser.role
                    },
                    token
                }
            });
        }catch (error) {
            console.error('Registration Error');
            res.status(500).json({
                success:false,
                message: 'Registration Failed',
                error: error.message
            })
        }
    },

    // Register Student
    registerStudent : async (req, res) => {
            try {
                const {
                    fullName,
                    email,
                    password,
                    dob,
                    guardianId,
                    registeredBy,
                    faceData,
                    fingerprintData,
                    profileImage,
                    address
                } = req.body;

                // Validate input
                if (!fullName || !email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields'
                    });
                }

                // Verify the registrar
                const registrar = await User.findById(registeredBy);
                if (!registrar || (registrar.role !== 'teacher' && registrar.role !== 'parent')) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid registrar. Must be a parent or teacher'
                    });
                }

                // Find guardian if provided
                let guardian = null;
                if (guardianId) {
                    guardian = await User.findOne({ _id: guardianId, role: 'parent' });
                    if (!guardian) {
                        return res.status(400).json({
                            success: false,
                            message: 'Guardian not found with the provided ID'
                        });
                    }
                }

                // Check if student already exists
                const existingUser = await User.findOne({ email: email.toLowerCase() });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Student with this email already exists'
                    });
                }

                // Create new student
                const newStudent = new User({
                    fullName,
                    email: email.toLowerCase(),
                    address,
                    password,
                    dob,
                    role: 'student',
                    registeredBy,
                    guardian: guardian ? guardian._id : null,
                });

                // Save student
                await newStudent.save();

                // Upload biometric data if provided
                if (faceData) {
                    try {
                        newStudent.faceData = await uploadToFirebase(faceData, newStudent._id, 'face');
                    } catch (uploadError) {
                        console.error('Face data upload failed:', uploadError);
                    }
                }

                if (fingerprintData) {
                    try {
                        newStudent.fingerprintData = await uploadToFirebase(fingerprintData, newStudent._id, 'fingerprint');
                    } catch (uploadError) {
                        console.error('Fingerprint data upload failed:', uploadError);
                    }
                }

                // Save again if biometric data was uploaded
                if (faceData || fingerprintData) {
                    await newStudent.save();
                }

                // Generate JWT Token
                const token = generateToken(newStudent);

                // Respond with student details (excluding sensitive information)
                res.status(201).json({
                    success: true,
                    message: 'Student registered successfully',
                    data: {
                        student: {
                            id: newStudent._id,
                            fullName: newStudent.fullName,
                            email: newStudent.email,
                            address: newStudent.address,
                            dob: newStudent.dob,
                            registeredBy: newStudent.registeredBy,
                            guardian: newStudent.guardian
                        },
                        token
                    }
                });
            } catch (error) {
                console.error('Student registration error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Student registration failed',
                    error: error.message
                });
            }
        },

    // Get All students for a teacher
    getTeacherStudents : async (req,res) => {
        try {
            const teacherId = req.params.teacherId;
            const teacher = await User.findOne({_id:teacherId,role:'teacher'});
            if (!teacher){
                return res.status(404).json({
                    success:false,
                    message:'Teacher not found'
                });
            }

            // Find All Student registered by this teacher
            const students = await User.find({
                role:'student',
                registeredBy: teacherId
            }).select('-password-fingerprintData-faceData');

            res.status(200).json({
                success: true,
                count: students.length,
                data: students
            });
        }catch (error) {
            console.log('Get students error:',error);
            res.status(500).json({
                success:false,
                message:'Failed to fetch students',
                error:error.message
            });
        }
    },
    // Get children for a parent
    getParentChildren: async (req, res) => {
        try {
            const parentId = req.params.parentId;

            // Verify the parent exists
            const parent = await User.findOne({ _id: parentId, role: 'parent' });
            if (!parent) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent not found'
                });
            }

            // Find all students with this parent as guardian
            const children = await User.find({
                role: 'student',
                guardian: parentId
            }).select('-password -fingerprintData -faceData');

            res.status(200).json({
                success: true,
                count: children.length,
                data: children
            });
        } catch (error) {
            console.error('Get children error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch children',
                error: error.message
            });
        }
    },
    // Login with credential
    login:async (req,res)=>{
        try {
            const {email,password} = req.body;
            const user = await User.findOne({email});
            if (!user) {
                return res.status(404).json({
                    success:false,
                    message:'User not found'
                });
            }
            // Verify Password
            const isMatch = await bcrypt.compare(password,user.password);
            if (!isMatch){
                return res.status(401).json({
                    success:false,
                    message:'Invalid credentials'
                });
            }

            // Generate JWT token
            const token = generateToken(user);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        role: user.role,
                    },token
                }
            });
        }catch (error) {
            console.error('Login Error:',error);
            res.status(5)
        }
    },

    // Biometric authentication (fingerprint)
    fingerprintLogin: async (req, res) => {
        try {
            const { fingerprintData, userId } = req.body;

            if (!fingerprintData || !userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Fingerprint data and user ID are required'
                });
            }

            // In a real app, you would compare the fingerprint data with stored fingerprints
            // For React Native fingerprint authentication, you typically receive a boolean success
            // rather than the actual fingerprint data, so we need to verify the user separately

            const user = await User.findById(userId);

            if (!user || !user.fingerprintData) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication failed. User not found or fingerprint not registered.'
                });
            }
            // Generate JWT Token
            const token = generateToken(user);


            // In a real app, you would verify the fingerprint data here
            // For now, we'll just assume it's valid if the user has fingerprint data registered
            res.status(200).json({
                success: true,
                message: 'Fingerprint authentication successful',
                data: {
                    user: {
                        id: user._id,
                        fullname: user.fullname,
                        email: user.email,
                        role: user.role,
                    },token
                }
            });
        } catch (error) {
            console.error('Fingerprint authentication error:', error);
            res.status(500).json({
                success: false,
                message: 'Authentication failed',
                error: error.message
            });
        }
    },
    // Biometric authentication (face)
    faceLogin: async (req, res) => {
        try {
            const { faceData, userId } = req.body;

            if (!faceData || !userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Face data and user ID are required'
                });
            }

            // Similar to fingerprint, face authentication in React Native usually returns
            // a success boolean rather than actual face data for comparison

            const user = await User.findById(userId);

            if (!user || !user.faceData) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication failed. User not found or face not registered.'
                });
            }

            // Generate JWT Token
            const token = generateToken(user);

            // In a real app, you would verify the face data here
            // For now, we'll just assume it's valid if the user has face data registered
            res.status(200).json({
                success: true,
                message: 'Face authentication successful',
                data: {
                    user: {
                        id: user._id,
                        fullname: user.fullname,
                        email: user.email,
                        role: user.role,
                    },token
                }
            });
        } catch (error) {
            console.error('Face authentication error:', error);
            res.status(500).json({
                success: false,
                message: 'Authentication failed',
                error: error.message
            });
        }
    },
    updateUser:async (req,res) => {
        try {
            const {id} = req.params;
            const {fullName,email,dob,address,password,fingerprintData,faceData} = req.body;

            const user = await User.findById(id);
            if (!user){
                return res.status(404).json({
                    success:false,
                    message:'User not found',
                });
            };

            user.fullName = fullName || user.fullName;
            user.email = email || user.email;

            if (dob){
                user.dob = new Date(dob);
            }
            if (address){
                user.address = address;
            }
            if (password){
                if (password.length < 6){
                    return res.status(400).json({success:false,message:'Password must be att least 6 character long'});
                }
            }
            if (fingerprintData) {
                user.fingerprintData = fingerprintData;
            }

            if (faceData) {
                user.faceData = faceData;
            }

            // Save the updated user
            await user.save();

            // Return updated user info (exclude sensitive data)
            const userResponse = {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                dob: user.dob,
                address: user.address,
                fingerprintData: !!user.fingerprintData,
                faceData: !!user.faceData
            };

            res.json({
                message: 'Profile updated successfully',
                data: userResponse
            });
        }catch (error){
            console.error('Update Profile Error:', error);

            if (error.code === 11000) {
                return res.status(400).json({ message: 'Email already in use' });
            }

            res.status(500).json({
                message: 'Server error occurred while updating profile',
                error: error.message
            });
        }
    },
    universalBiometricLogin: async(req,res)=>{
        try {
            const { userIdentifier, biometricVerified } = req.body;
    
            // Validate input
            if (!userIdentifier || !biometricVerified) {
                return res.status(400).json({ 
                    message: 'Invalid authentication attempt' 
                });
            }
    
            // Find user by email or student ID
            const user = await User.findOne({
                $or: [
                    { email: userIdentifier },
                    { studentId: userIdentifier }
                ],
                // Optional: Add additional verification for biometric-enabled accounts
                biometricLoginEnabled: true
            });
    
            // Check if user exists and is authorized for biometric login
            if (!user) {
                return res.status(401).json({ 
                    message: 'User not found or biometric login not enabled' 
                });
            }
    
            // Generate authentication token
            const token = generateToken(user);
    
            // Return user data and token
            res.status(200).json({
                status: 'success',
                data: {
                    token,
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                        name: user.name
                    }
                }
            });
        } catch (error) {
            console.error('Universal Biometric Login Error:', error);
            res.status(500).json({ 
                message: 'Biometric login failed',
                error: error.message 
            });
        }
    }
};

module.exports = userController;