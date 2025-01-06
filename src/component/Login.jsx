import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { SlEnvolope } from "react-icons/sl";

Modal.setAppElement("#root");

const Login = () => {
  const [emailID, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const credentials = {
      emailID,
      password,
    };

    try {
      const response = await axios.post(
        "http://localhost:5070/onlineExam/login",
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      var jwttoken = response.data;
      var rawtoken = jwttoken.token;
      var token = rawtoken.replace("Bearer ", "");
      const userRole = jwttoken.role;

      localStorage.setItem("jwtToken", token);
      localStorage.setItem("username", emailID);
      setModalMessage("Login successful!");
      setModalType("success");
      setModalIsOpen(true);

      if (userRole == "ROLE_TEACHER") {
        navigate("/teacher-dashboard");
      } else if (userRole == "ROLE_STUDENT") {
        navigate("/student-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setModalMessage("Invalid email or password.");
      setModalType("error");
      setModalIsOpen(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-roboto">
      <div className="flex w-full max-w-4xl p-6 space-x-8 bg-white rounded-lg shadow-lg ">
        {/* Login Form */}
        <div className="w-full max-w-md space-y-4 p-14">
          <h2 className="text-xl font-normal text-center text-stone-600">Log in to Continue..</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  id="email"
                  value={emailID}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 px-2 py-1 mt-1 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
                  placeholder="Email"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 px-2 py-1 mt-1 text-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
                  placeholder="Password"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            >
              Log in
            </button>
          </form>
          <div className="text-sm text-center">
            <span className="text-stone-600">Don't have an account? </span>
            <Link
              to="/signup"
              className="text-lime-500 hover:text-lime-600 text-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Image Section */}
        <div className="hidden md:block w-1/2">
          <img
            src="login.jpg"
            alt="Login illustration"
            className="object-cover w-full h-full rounded-lg"
          />
        </div>
      </div>

      {/* Modal for displaying messages */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Message"
        className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50"
        overlayClassName="fixed inset-0"
      >
        <div
          className={`w-80 p-4 bg-white rounded-lg shadow-lg ${
            modalType === "error"
              ? "border-red-500 border"
              : "border-green-500 border"
          }`}
        >
          <h2 className="text-lg font-bold">
            {modalType === "error" ? "Error" : "Success"}
          </h2>
          <p className="mt-2">{modalMessage}</p>
          <button
            onClick={() => setModalIsOpen(false)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
