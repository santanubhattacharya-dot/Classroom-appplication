import React, { useEffect, useRef,useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Confetti from "react-confetti";


const ExamComponent = () => {
  const { examId, examName , studentId } = useParams(); // Get the examId from the URL
  const navigate = useNavigate(); // React Router navigate hook
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // Initial 5 minutes timer (300 seconds) will be updated based on totalTime
  const [marks, setMarks] = useState(0); // To store the calculated marks after submission
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);
  const hasSubmittedRef = useRef(false); // Guard variable to prevent multiple submissions
  const timer=totalTime;
  const startTime = useRef(Date.now());  // To track start time


  // useEffect(() => {
  //   const currentTime = new Date().toISOString();
  //   setStartTime(currentTime);
  //   console.log("Start Time:", currentTime); // Log the value directly
  // }, []);

  useEffect(() => {

    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axios.get(
          `http://localhost:5070/onlineExam/questionsdetails/${examId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fetchedQuestions = response.data;
        setQuestions(fetchedQuestions);

        const time = await axios.get(
          `http://localhost:5070/onlineExam/get-time/${examId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const examtime = time.data;
        setTotalTime(examtime);
        setTimeLeft(examtime * 60);

        const optionsPromises = fetchedQuestions.map(async ([_, questionId]) => {
          const optionsResponse = await axios.get(
            `http://localhost:5070/onlineExam/options/${questionId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return { [questionId]: optionsResponse.data };
        });
        const allOptions = await Promise.all(optionsPromises);
        setOptions(Object.assign({}, ...allOptions));

        setLoading(false);
      } catch (err) {
        console.error("Error fetching exam details:", err);
        setError("Failed to load exam details");
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [examId]);

  // Timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          if (!hasSubmittedRef.current) {
            hasSubmittedRef.current = true; // Set the guard to true
            handleSubmit(); // Call the submit function once
          }
          return 0; // Stop timer at 0
        }
        return prevTime - 1; // Decrement time
      });
    }, 1000);

    return () => clearInterval(timerRef.current); // Cleanup interval on unmount
  }, [totalTime]);


  // Prevent back button navigation
  useEffect(() => {
    // Function to prevent back navigation by manipulating history
    const preventBackNavigation = () => {
      // Push the current state to the history stack to prevent going back
      window.history.pushState(null, "", window.location.href);
    };
    // Initially lock the back button
    preventBackNavigation();

    // Popstate event listener to handle the back button press
    const handlePopState = (event) => {
      // Show a confirmation dialog when the user presses the back button
      const confirmation = window.confirm("Are you sure you quit exam ?");

      if (confirmation) {
        // If the user clicks "OK", submit the exam and navigate to /exams
        submitExamAndRedirect();
      } else {
        // If the user clicks "Cancel", keep them on the current page
        preventBackNavigation();
      }
    };

    // Attach popstate event listener to intercept back navigation
    window.addEventListener("popstate", handlePopState);

    // Optional: Warn on page refresh or tab close
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // Display the browser's default message
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Cleanup event listeners on component unmount
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [totalTime]);

  // Function to submit the exam and redirect to /exams
  const submitExamAndRedirect = () => {
    // submit the exam 
    handleSubmit();
    console.log("Submitting the exam...");

    // Redirect to /exams after submitting the exam
    navigate("/exams");
  };

//tab switch notification
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert("Switching tabs is not allowed during the exam!");
      }
    };
  
    document.addEventListener("visibilitychange", handleVisibilityChange);
  
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  
  // mouse right click disable
  useEffect(() => {
    const disableRightClick = (event) => {
      event.preventDefault();
    };
  
    document.addEventListener("contextmenu", disableRightClick);
  
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

// right click key disable
useEffect(() => {
  const disableRefresh = (event) => {
    if (
      (event.key === "F5") || // F5
      (event.ctrlKey && event.key === "r") || // Ctrl+R
      (event.metaKey && event.key === "r") // Cmd+R (Mac)
    ) {
      event.preventDefault();
      alert("Page refresh is disabled during the exam.");
    }
  };

  window.addEventListener("keydown", disableRefresh);

  return () => {
    window.removeEventListener("keydown", disableRefresh);
  };
}, []);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const formatTotalTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const handleOptionChange = (questionId, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const calculateMarks = () => {
    let score = 0;
    questions.forEach(([_, questionId, correctAnswer]) => {
      if (selectedAnswers[questionId] === correctAnswer) {
        score++;
      }
    });
    console.log("score from calculatemarks function:",score);
    setMarks(score);
    return score;
  };

  //submit exam api call below
  const SubmitExam = async () => {
    if (isSubmitted) return; 
    setIsSubmitted(true);
   var examID=examId;
  var totalTime=timer;
  var totalMarks=questions.length;
  var candidateName=studentId;
  const marks=calculateMarks();
  const submittedTime = Date.now();

     const examData = {
       examID,
      examName,
      candidateName,
      totalTime,
      startTime:new Date(startTime.current).toISOString(),
      submittedTime:new Date(submittedTime).toISOString(),
      marks,
      totalMarks,
     };
     console.log("submitted exam details:",examData);
     console.log("JWT Token:", localStorage.getItem("jwtToken"));
     try {
       await axios.post(
         "http://localhost:5070/onlineExam/submit-exam",
         examData,
         {
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
           },
         }
       );
      //  alert("Exam submitted successfully !");
     } catch (error) {
       console.error(
         "Error while submitting exam:",
         error.response ? error.response.data : error.message
       );
     }
   };

//delete the exams from assigned student  database 
   const deleteExam = async ()=>{
    try {
      await axios.delete(
        `http://localhost:5070/onlineExam/delete-student/${examId}/${studentId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
    } catch (error) {
      console.error(
        "Error while deleting exam:",
        error.response ? error.response.data : error.message
      );
    }

   }
    // submit the exam
    const handleSubmit = async () => {
      if (isSubmitted) return; 
      clearInterval(timerRef.current);
      setIsSubmitted(true);
     const marks=calculateMarks();
      console.log("Marks from exam component:", marks);
     // setShowConfetti(true); // Show confetti after submission

      // Wait for the exam submission to complete
      await SubmitExam();
      await deleteExam();
      console.log("exam delete succesfully..");
      // Navigate to the results page after submission
      navigate(`/exam-result/${marks}/${questions.length}`);
    };

  const toggleMarkForReview = (questionId) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const goToStudentDashboard = () => {
    navigate("/exams");
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>{error}</p>;

  const currentQuestion = questions[currentQuestionIndex];
  const currentOptions = currentQuestion ? options[currentQuestion[1]] : [];

  return (
    <div className="p-6 min-h-screen bg-gray-100 flex">
      {/* Left Card for Timer and Question Numbers */}
      <div className="bg-white shadow-lg p-6 rounded-lg w-1/4 mr-6 flex flex-col items-center">
        <p className="mb-2 text-gray-600 font-semibold">
          Total Time: {formatTotalTime(totalTime)}
        </p>

        <div className="w-24 mb-6">
          <CircularProgressbar
            value={(timeLeft / (totalTime * 60)) * 100}
            text={formatTime(timeLeft)}
            styles={buildStyles({
              textSize: "16px",
              pathColor: "#29BF12",
              textColor: "#3b82f6",
            })}
          />
        </div>

        <div className="space-y-2">
          {questions.map(([_, questionId], index) => {
            let buttonColor;

            if (currentQuestionIndex === index) {
              buttonColor = "bg-orange-500";
            } else if (markedForReview[questionId]) {
              buttonColor = "bg-yellow-500"; // Yellow for marked for review
            } else if (selectedAnswers[questionId]) {
              buttonColor = "bg-green-500";
            } else {
              buttonColor = "bg-blue-500";
            }

            return (
              <button
                key={index}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${buttonColor}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-center text-sm">
          <p className="text-blue-500">• Unanswered</p>
          <p className="text-green-500">• Answered</p>
          <p className="text-orange-500">• Current Question</p>
          <p className="text-yellow-500">• Marked for Review</p>
          <p className="text-gray-950">• Each question is of 1 mark</p>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1">
        {/*isSubmitted ? (
          <div className="bg-white shadow-lg p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">
              Your Score: {marks} / {questions.length}
            </h2>
            {showConfetti && <Confetti recycle={false} />}
            <p className="text-lg font-semibold mb-4">
              Congratulations on completing the exam!
            </p>
            <button
              onClick={goToStudentDashboard}
              className="bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Go to Exam Dashboard
            </button>
          </div> 
         
        ) : (   */}

         { currentQuestion && (
            <div className="bg-white shadow-lg p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">{currentQuestion[0]}</h2>

              <div className="space-y-2">
                {currentOptions.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name={`question-${currentQuestion[1]}`}
                      className="mr-2"
                      onChange={() =>
                        handleOptionChange(currentQuestion[1], option)
                      }
                      checked={selectedAnswers[currentQuestion[1]] === option}
                    />
                    <label htmlFor={`option-${index}`} className="text-lg">
                      {option}
                    </label>
                  </div>
                ))}
              </div>

              {/* Mark as Review and Navigation buttons */}
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => toggleMarkForReview(currentQuestion[1])}
                  className={`px-4 py-2 rounded-md text-white ${
                    markedForReview[currentQuestion[1]]
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                >
                  {markedForReview[currentQuestion[1]]
                    ? "Unmark Review"
                    : "Mark for Review"}
                </button>

                <div className="space-x-2">
                  <button
                     className={`px-4 py-2 rounded-md text-white ${
                      currentQuestionIndex === 0
                        ? "bg-gray-300" // Color when on the last question
                        : "bg-blue-500" // Default color
                    }`}
                    disabled={currentQuestionIndex === 0}
                    onClick={() =>
                      setCurrentQuestionIndex(
                        Math.max(0, currentQuestionIndex - 1)
                      )
                    }
                  >
                    Previous
                  </button>

                  <button
                     className={`px-4 py-2 rounded-md text-white ${
                      currentQuestionIndex === questions.length - 1
                        ? "bg-gray-300" // Color when on the last question
                        : "bg-blue-500" // Default color
                    }`}
                    disabled={currentQuestionIndex === questions.length - 1}
                    onClick={() =>
                      setCurrentQuestionIndex(
                        Math.min(questions.length - 1, currentQuestionIndex + 1)
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Submit button */}
              {currentQuestionIndex === questions.length - 1 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleSubmit}
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                  >
                    Submit Exam
                  </button>
                </div>
              )}
            </div>
          )
        }
      </div>
    </div>
  );
};

export default ExamComponent;
