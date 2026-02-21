import { useState } from "react";
import WelcomeScreen from "./components/WelcomeScreen";
import ChallengeScreen from "./components/ChallengeScreen";
import CompletionScreen from "./components/CompletionScreen";
import { challenges } from "./data/challenges";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("welcome"); // 'welcome' | 'challenge' | 'completion'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [starPositions] = useState(() =>
    Array.from({ length: 80 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${1.5 + Math.random() * 2}s`,
      width: `${1 + Math.random() * 2}px`,
      height: `${1 + Math.random() * 2}px`,
    }))
  );

  function handleStart() {
    setScreen("challenge");
    setCurrentIndex(0);
    setCompletedChallenges([]);
    setTotalPoints(0);
  }

  function handleChallengeComplete(points) {
    const newCompleted = [
      ...completedChallenges,
      { ...challenges[currentIndex], earnedPoints: points },
    ];
    setCompletedChallenges(newCompleted);
    setTotalPoints((prev) => prev + points);

    if (currentIndex + 1 < challenges.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setScreen("completion");
    }
  }

  function handleSkip() {
    if (currentIndex + 1 < challenges.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setScreen("completion");
    }
  }

  function handleRestart() {
    setScreen("welcome");
  }

  return (
    <div className="app">
      <div className="stars" aria-hidden="true">
        {starPositions.map((style, i) => (
          <div key={i} className="star" style={style} />
        ))}
      </div>

      {screen === "welcome" && <WelcomeScreen onStart={handleStart} />}

      {screen === "challenge" && (
        <ChallengeScreen
          challenge={challenges[currentIndex]}
          challengeIndex={currentIndex}
          totalChallenges={challenges.length}
          totalPoints={totalPoints}
          onComplete={handleChallengeComplete}
          onSkip={handleSkip}
        />
      )}

      {screen === "completion" && (
        <CompletionScreen
          completedChallenges={completedChallenges}
          totalPoints={totalPoints}
          maxPoints={challenges.reduce((sum, c) => sum + c.points, 0)}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
