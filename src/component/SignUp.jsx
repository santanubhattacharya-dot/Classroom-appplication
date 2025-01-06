import React, { useState } from 'react';
import axios from 'axios';
import { Link,useNavigate } from 'react-router-dom'; // Import useNavigate
import { TextField, Button,MenuItem } from '@mui/material'; // Import TextField and Button from MUI

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [emailID, setEmail] = useState('');
  const [mobileNo, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('student'); // State for designation
  const [loading, setLoading] = useState(false); // State to track the loading spinner
  const [showModal, setShowModal] = useState(false); // State to handle modal visibility
  const [modalMessage, setModalMessage] = useState(''); // State to handle the modal message
  const [isRegistrationSuccessful, setIsRegistrationSuccessful] = useState(false); // State to check registration success
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when the form is submitted

    const userDetails = {
      fullName,
      emailID,
      mobileNo,
      password,
      role: designation, // Include designation in the user details
    };

    try {
      const response = await axios.post('http://localhost:5070/onlineExam/signup', userDetails, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setModalMessage('Successfully registered!'); // Success message
      setIsRegistrationSuccessful(true); // Mark registration as successful
    } catch (error) {
      setModalMessage('Registration failed. Please try again.'); // Error message
      setIsRegistrationSuccessful(false); // Mark registration as unsuccessful
    } finally {
      setLoading(false); // Hide the spinner
      setShowModal(true); // Show the modal
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (isRegistrationSuccessful) {
      navigate('/login'); // Redirect to the login page after successful registration
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-roboto">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-normal text-center text-stone-600">Sign Up</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
        <TextField
            label="Full Name"
            variant="outlined"
            fullWidth
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            value={emailID}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Mobile No."
            variant="outlined"
            fullWidth
            value={mobileNo}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
         <TextField
            label="Set Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
         {/* Designation Dropdown */}
         <TextField
            label="Designation"
            select
            variant="outlined"
            fullWidth
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required
          >
            <MenuItem value="STUDENT">Student</MenuItem>
            <MenuItem value="TEACHER">Teacher</MenuItem>
          </TextField>

          {/* Sign Up Button */}
          <button
            type="submit"
          
             className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            fullWidth
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
        <div className="text-sm text-center">
            <span className="text-stone-600">Already have an account? </span>
            <Link
              to="/login"
              className="text-lime-500 hover:text-lime-600 text-sm"
            >
             Log in
            </Link>
          </div>

        {/* Modal Popup */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p>{modalMessage}</p>
              <button
                onClick={handleCloseModal} // Close modal and redirect if registration is successful
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;
