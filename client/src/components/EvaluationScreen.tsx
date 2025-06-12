import { type Student } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ThumbsDown,
  ThumbsUp,
  Star,
  Moon,
  EllipsisVertical,
} from "lucide-react";
import StudentCard from "./StudentCard";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EvaluationScreenProps {
  currentStudent: Student | undefined;
  currentIndex: number;
  totalStudents: number;
  studentsNot: number;
  currentEvaluation: "poor" | "good" | "great" | null;
  setCurrentEvaluation: (evaluation: "poor" | "good" | "great") => void;
  onEvaluate: (value: "poor" | "good" | "great") => void;
  onSkip: () => void;
  onEnd: () => void;
  onNext: (value: "poor" | "good" | "great") => void;
  onFinish: () => void;
  setPunishmentModalOpen: (open: boolean) => void;
  isNextEnabled: boolean;
  allStudents: Student[];
  onStudentSelect?: (student: Student) => void;
  onForceStop?: () => void;
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
  onEnd,
  onNext,
  onFinish,
  setPunishmentModalOpen,
  isNextEnabled,
  allStudents,
  onStudentSelect,
}: EvaluationScreenProps) {
  const [studentKey, setStudentKey] = useState(0);
  const [status, setStatus] = useState<"great" | "good" | "poor">("great");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Filter students based on search query
  console.log(allStudents);
  const filteredStudents = allStudents.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update key when student changes to trigger animation
  useEffect(() => {
    setStudentKey((prevKey) => prevKey + 1);
  }, [currentStudent]);

  var studentsAskedNumber = Math.abs(studentsNot - totalStudents);

  const progressPercent =
    totalStudents > 0 // totalStudents
      ? (studentsAskedNumber / totalStudents) * 100 // totalStudents
      : 0;

  return (
    <div className="p-6 transition-all duration-300 transform flex flex-col justify-between h-full">
      {/* Progress Indicator */}
      <div className="mb-4 flex gap-4">
        <div className="flex-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Evaluated Students</span>
            <span className="text-sm font-medium">
              {totalStudents > 0
                ? `${studentsAskedNumber} of ${totalStudents}`
                : "Loading..."}{" "}
              {/* totalStudents */}
            </span>
          </div>
          <Progress value={progressPercent} className="w-full h-2.5" />
        </div>
        <div className="flex-none">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
                <EllipsisVertical className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                  >
                    Force close round & move to next
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will immediately end the current evaluation
                      round. This action cannot be undone and any unsaved
                      progress will be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onEnd}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Force Close
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {/* <DropdownMenuSeparator /> */}
              {/* <DropdownMenuItem onClick={onFinish}>
                Finish Evaluation
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative">
        <Input
          className="mb-6"
          placeholder="🔎 Search Student"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => setShowSearchResults(true)}
          onBlur={() => {
            // Small delay to allow click events on the results
            setTimeout(() => setShowSearchResults(false), 200);
          }}
        />
        {showSearchResults && (
          <div className="absolute w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {(searchQuery ? filteredStudents : allStudents).map((student) => (
              <div
                key={student._id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  if (onStudentSelect) {
                    onStudentSelect(student);
                  }
                  setSearchQuery("");
                  setShowSearchResults(false);
                }}
              >
                {student.name} ({student.rollNumber})
              </div>
            ))}
            {searchQuery && filteredStudents.length === 0 && (
              <div className="p-2 text-gray-500">No students found</div>
            )}
          </div>
        )}
      </div>

      {/* Student Card */}
      <div
        key={studentKey}
        className="transform transition-transform duration-300 mb-auto"
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
              onEvaluate("poor");
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

      <div className="flex space-x-3 w-full bg-white p-4 z-10 border-t border-gray-200">
        <div className="flex flex-wrap w-full max-w-xl mx-auto">
          <div className="flex w-full space-x-3">
            <Button
              variant="outline"
              className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              onClick={onSkip}
            >
              Skip
            </Button>
            <Button
              variant="outline"
              className="flex-1 py-3 border border-destructive text-destructive rounded-lg font-medium hover:bg-destructive hover:text-white transition-colors"
              onClick={onFinish}
            >
              Finish Evaluation
            </Button>
            {/* <div>
              <Button
                variant="outline"
                className="flex-1 py-3 border border-yellow-600 text-yellow-600 rounded-full w-fit font-medium hover:bg-yellow-600 hover:text-white transition-colors"
                onClick={onEnd}
                disabled={true}
              >
                ER?
              </Button>
            </div> */}
          </div>
          <div className="flex w-full"></div>
        </div>
      </div>

      {/* Finish Button
      <div className="mt-8">
        <Button
          variant="outline"
          className="flex-1 py-3 border border-destructive text-destructive rounded-lg font-medium hover:bg-destructive hover:text-white transition-colors"
          onClick={onFinish}
        >
          Finish Evaluation
        </Button>
      </div> */}
    </div>
  );
}
