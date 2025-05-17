import { type Student } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ThumbsDown, ThumbsUp, Star, Moon } from "lucide-react";
import StudentCard from "./StudentCard";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";

interface EvaluationScreenProps {
  currentStudent: Student | undefined;
  currentIndex: number;
  totalStudents: number;
  studentsNot: number;
  currentEvaluation: "poor" | "good" | "great" | null;
  setCurrentEvaluation: (evaluation: "poor" | "good" | "great") => void;
  onEvaluate: (value: "poor" | "good" | "great") => void;
  onSkip: () => void;
  onNext: (value: "poor" | "good" | "great") => void;
  onFinish: () => void;
  setPunishmentModalOpen: (open: boolean) => void;
  isNextEnabled: boolean;
}

export default function EvaluationScreen({
  currentStudent,
  currentIndex,
  totalStudents,
  studentsNot,
  currentEvaluation,
  setCurrentEvaluation,
  onEvaluate,
  onSkip,
  onNext,
  onFinish,
  setPunishmentModalOpen,
  isNextEnabled,
}: EvaluationScreenProps) {
  const [studentKey, setStudentKey] = useState(0);
  const [status, setStatus] = useState<"great" | "good" | "poor">("great");

  // Update key when student changes to trigger animation
  useEffect(() => {
    setStudentKey((prevKey) => prevKey + 1);
  }, [currentStudent]);

  var studentsAskedNumber = Math.abs(studentsNot - totalStudents) 

  const progressPercent =
    totalStudents > 0 // totalStudents
      ? (studentsAskedNumber / totalStudents) * 100 // totalStudents
      : 0;

  return (
    <div className="p-6 transition-all duration-300 transform">
      {/* <Input className="mb-4" placeholder="🔎 Search Student" /> */}
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Evaluated Students</span>
          <span className="text-sm font-medium">
            {totalStudents > 0 ? `${studentsAskedNumber} of ${totalStudents}` : "Loading..."} {/* totalStudents */}
          </span>
        </div>
        <Progress value={progressPercent} className="w-full h-2.5" />
      </div>

      {/* Student Card */}
      <div
        key={studentKey}
        className="transform transition-transform duration-300"
      >
        <StudentCard student={currentStudent} animate />
      </div>

      {/* Evaluation Buttons */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Evaluate Student:
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            className={`flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-green-50 transition-all ${
              currentEvaluation === "great" ? "ring-2 ring-green-500" : ""
            }`}
            onClick={() => {
              onEvaluate("great");
              setStatus("great");
            }}
          >
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
              <Star className="text-white w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Great</span>
          </button>

          <button
            className={`flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-yellow-50 transition-all ${
              currentEvaluation === "good" ? "ring-2 ring-yellow-500" : ""
            }`}
            onClick={() => {
              onEvaluate("good");
              setCurrentEvaluation("good");
              setStatus("good");
            }}
          >
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center mb-2">
              <ThumbsUp className="text-white w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Good</span>
          </button>

          <button
            className={`flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-red-50 transition-all ${
              currentEvaluation === "poor" ? "ring-2 ring-red-500" : ""
            }`}
            onClick={() => {
              onEvaluate("poor")
              setCurrentEvaluation("poor");
              setStatus("poor");
            }}
          >
            <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center mb-2">
              <ThumbsDown className="text-white w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Poor</span>
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      {/* <div className="flex space-x-3 mb-3">
        {status !== "great" && (
          <Button
            variant="destructive"
            className="flex-1 py-3 border border-gray-300 rounded-lg font-medium transition-colors"
            onClick={() => setPunishmentModalOpen(true)}
          >
            Punishment
          </Button>
        )}
      </div> */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          onClick={onSkip}
        >
          Skip
        </Button>
        {/* <Button
          className="flex-1 py-3 rounded-lg font-medium transition-colors"
          onClick={() => onEvaluate(status)}
          disabled={status === "great"}
        > 
          Next
        </Button> */}
        <Button
          variant="outline"
          className="flex-1 py-3 border border-destructive text-destructive rounded-lg font-medium hover:bg-destructive hover:text-white transition-colors"
          onClick={onFinish} 
        >
          Finish Evaluation
        </Button>
      </div>

      {/* Finish Button */}
      <div className="mt-8">
      </div>
    </div>
  );
}
