import { useState, useEffect } from "react";
import Header from "@/components/Header";
import StartScreen from "@/components/StartScreen";
import EvaluationScreen from "@/components/EvaluationScreen";
import { useToast } from "@/hooks/use-toast";
import FeedbackToast from "@/components/FeedbackToast";
import { useQuery } from "@tanstack/react-query";
import { type Student } from "@shared/schema";
import PunishmentModal from "@/components/PunishmentModal";


export interface ClassInfo {
  id: number;
  name: string;
}

export interface SubjectInfo {
  id: number;
  name: string;
}

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<"start" | "evaluation">(
    "start"
  );
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectInfo | null>(
    null
  );
  const [punishmentModalOpen, setPunishmentModalOpen] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<
    "poor" | "good" | "great" | null
  >(null);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const { toast } = useToast();

  // Fetch classes
  const { data: classes = [] } = useQuery<ClassInfo[]>({
    queryKey: ["/api/classes"],
    refetchOnWindowFocus: false,
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery<SubjectInfo[]>({
    queryKey: ["/api/subjects"],
    refetchOnWindowFocus: false,
  });

  console.log("Classes:", classes);
  console.log("Subjects:", subjects);

  // Fetch students based on selected class
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<
    Student[]
  >({
    queryKey: ["/api/students/class", selectedClass?.id],
    enabled: !!selectedClass,
    refetchOnWindowFocus: false,
  });

  console.log("Students:", students);

  // Get current student
  const currentStudent = students[currentStudentIndex];

  const handleClassSelect = (classItem: ClassInfo) => {
    setSelectedClass(classItem);
  };


  const handleSubjectSelect = async (subject: SubjectInfo) => {
    await setSelectedSubject(subject); // Schedule the state update
    console.log("Selected Subject:", selectedSubject);
  };

  useEffect(() => {
    if (selectedSubject) {
      handleProceed(); // React to the updated state
    }
  }, [selectedSubject]); // Runs whenever selectedSubject changes

  // const handleSubjectSelect = async (subject: SubjectInfo) => {
  //   await setSelectedSubject(subject);
  //   if (selectedSubject) {
  //     handleProceed();
  //   } else {
  //     setSelectedSubject(subject);
  //     handleProceed();
  //   }
  // };

  const handleProceed = () => {
    if (selectedSubject) {
      //if (selectedClass && selectedSubject) {
      console.log("Evaluation started");
      setActiveScreen("evaluation");
    }
  };

  const handleGoHome = () => {
    setActiveScreen("start");
    setCurrentStudentIndex(0);
    setCurrentEvaluation(null);
  };

  const handleEvaluate = (value: "great" | "good" | "poor") => {
    setCurrentEvaluation(value);

    if (value !== "great") {
      // setPunishmentModalOpen(true);
    }
  };

  const handlePunishmentSubmit = (punishment: string) => {
    submitEvaluation(0, punishment);
    setPunishmentModalOpen(false);

    // Show feedback toast
    toast({
      title: "Poor evaluation recorded",
      variant: "destructive",
    });
  };

  const handlePunishmentCancel = () => {
    setPunishmentModalOpen(false);
    setCurrentEvaluation(null);
  };

  const handleSkip = () => {
    // Move to next student
    if (students.length > 0) {
      const nextIndex = (currentStudentIndex + 1) % students.length;
      setCurrentStudentIndex(nextIndex);
      setCurrentEvaluation(null);
    }
  };

  const handleNext = () => {
    if (currentEvaluation === "good") {
      submitEvaluation(1);
      toast({
        title: "Good evaluation recorded",
        variant: "default",
      });
    } else if (currentEvaluation === "great") {
      submitEvaluation(2);
      toast({
        title: "Great evaluation recorded",
        variant: "success",
      });
    }

    // Move to next student
    if (students.length > 0) {
      const nextIndex = (currentStudentIndex + 1) % students.length;
      setCurrentStudentIndex(nextIndex);
      setCurrentEvaluation(null);
    }
  };

  const handleFinish = () => {
    // Reset state and go back to start screen
    setActiveScreen("start");
    setCurrentStudentIndex(0);
    setCurrentEvaluation(null);

    toast({
      title: "Evaluation session completed",
      variant: "success",
    });
  };

  const submitEvaluation = async (mark: number, punishment?: string) => {
    if (!selectedClass || !selectedSubject || !currentStudent) return;

    try {
      await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: currentStudent.id,
          classId: selectedClass.id,
          subjectId: selectedSubject.id,
          mark,
          punishment: punishment || null,
        }),
        credentials: "include",
      });

      // Invalidate queries if needed
      queryClient.invalidateQueries({
        queryKey: ["/api/evaluations"],
      });
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
      toast({
        title: "Failed to save evaluation",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto max-w-md bg-white min-h-screen shadow-lg relative overflow-hidden">
      <Header
        selectedClass={selectedClass?.name}
        selectedSubject={selectedSubject?.name}
        showContext={activeScreen === "evaluation"}
        onHomeClick={handleGoHome}
      />

      <main className="relative">
        {activeScreen === "start" ? (
          <StartScreen
            classes={classes}
            subjects={subjects}
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            onClassSelect={handleClassSelect}
            onSubjectSelect={handleSubjectSelect}
            onProceed={handleProceed}
            isProceedEnabled={!!selectedSubject}
          />
        ) : (
          <EvaluationScreen
            currentStudent={currentStudent}
            currentIndex={currentStudentIndex}
            totalStudents={students.length}
            currentEvaluation={currentEvaluation}
            onEvaluate={handleEvaluate}
            onSkip={handleSkip}
            onNext={handleNext}
            onFinish={handleFinish}
            isNextEnabled={!!currentEvaluation && currentEvaluation === "great"}
            isLoading={isLoadingStudents}
          />
        )}
      </main>

      <PunishmentModal
        isOpen={punishmentModalOpen}
        onSubmit={handlePunishmentSubmit}
        onCancel={handlePunishmentCancel}
      />
    </div>
  );
}
