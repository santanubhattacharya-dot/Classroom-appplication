import React,{ useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";

const ResultComponent = () => {
  const navigate = useNavigate();
    // Receive the score and totalQuestions from state
    const { marks, questions } = useParams();
    
  useEffect(() => {
    // Redirect to "/exams" if the user attempts to navigate back
    const handlePopState = () => {
      navigate(`/exam-result/${marks}/${questions}`, { replace: true });
    };

    // Add the event listener for the popstate event
    window.addEventListener("popstate", handlePopState);

    // Push a new state to ensure we trap navigation
    window.history.pushState(null, "", window.location.href);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);


  const handleGoToDashboard = () => {
    navigate("/exams", { replace: true }); // Redirect to the dashboard and replace history
  };

  return (
    <div className="p-8 shadow-lg rounded-lg bg-white text-center  mt-14">
      <h2 className="text-2xl font-bold mb-2">
        Your Score: {marks} / {questions}
      </h2>
      <p className="text-gray-600 mb-4">Congratulations on completing the exam!</p>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={handleGoToDashboard}
      >
        Go to Exam Dashboard
      </button>
    </div>
  );
};

export default ResultComponent;
