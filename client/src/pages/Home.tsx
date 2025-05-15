import { useState, useEffect } from "react";
import Header from "@/components/Header";
import StartScreen from "@/components/StartScreen";
import EvaluationScreen from "@/components/EvaluationScreen";
import { useToast } from "@/hooks/use-toast";
import FeedbackToast from "@/components/FeedbackToast";
import { useQuery } from "@tanstack/react-query";
import { type Student } from "@shared/schema";
import PunishmentModal from "@/components/PunishmentModal";
import { s } from "vite/dist/node/types.d-aGj9QkWt";

export interface ClassInfo {
  id: number;
  name: string;
}

export interface SubjectInfo {
  subject: string;
  class: number;
}

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<"start" | "evaluation">(
    "start"
  );
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectInfo | null>(
    null
  );
  const [rounds, setRounds] = useState<
    { studentsNotAsked: string[]; _id: string }[]
  >([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [punishmentModalOpen, setPunishmentModalOpen] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<
    "poor" | "good" | "great" | null
  >(null);
  const [students, setStudents] = useState([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const { toast } = useToast();

  // Fetch students based on selected class
  const fetchStudents = async (classId: number) => {
    console.log("Fetching students for class ID:", classId);

    const response = await fetch(
      `https://v6xrx50k-5000.inc1.devtunnels.ms/api/students/class/${classId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch students");
    }
    const data = await response.json();
    console.log("Fetched Students:", data);
    setStudents(data);
    return data;
  };

  const createRound = async (subject: SubjectInfo, students: Student[]) => {
    console.log("Creating round for subject:", subject);

    const response = await fetch(
      `https://v6xrx50k-5000.inc1.devtunnels.ms/api/rounds/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          studentsNotAsked: students.map((student) => student._id),
          subject: subject.subject,
          class: subject.class,
          totalStudents: students.length,
          startedAt: new Date(),
        }),
      }
    );
    if (!response.ok) {
      console.log("Failed to create round:", response.statusText);

      throw new Error("Failed to create round" + response.statusText);
    }
    const data = await response.json();
    setRounds(data);
    console.log("Created Round:", data);
  };

  // Fetch round based on selected subject and class
  const fetchRound = async (subject: SubjectInfo) => {
    console.log("Fetching round for subject:", subject);
    const response = await fetch(
      `https://v6xrx50k-5000.inc1.devtunnels.ms/api/rounds/${subject.subject}/${subject.class}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) {
      console.log(students);

      createRound(subject, students);
      // throw new Error("Failed to fetch round");
    }
    const data = await response.json();
    setRounds(data);
    const currentStudent = getRandomStudent(data);
    console.log("Random Student:", currentStudent);
    console.log("Fetched Round:", data);
  };

  const getRandomStudent = async (fetchedRounds: string | any[]) => {
    console.log(fetchedRounds);

    if (fetchedRounds.length > 0) {
      const currentRound = fetchedRounds[0] as { studentsNotAsked: string[] }; // Assuming the first round is the active one
      const studentsNotAsked = currentRound.studentsNotAsked;
      console.log("Students Not Asked:", studentsNotAsked);
      if (studentsNotAsked && studentsNotAsked.length > 0) {
        const randomIndex = Math.floor(Math.random() * studentsNotAsked.length);
        fetchStudent(studentsNotAsked[randomIndex]);
        // await students?.filter(
        //   (student: { _id: string }) =>
        //     student._id === studentsNotAsked[randomIndex]
        // )[0];
        // console.log("Matched Student:", matchedStudent);
        // setCurrentStudent(matchedStudent);
        return studentsNotAsked[randomIndex];
      }
    }
    return null;
  };

  const fetchStudent = async (studentId: string) => {
    console.log("Fetching student with ID:", studentId);
    const response = await fetch(
      `https://v6xrx50k-5000.inc1.devtunnels.ms/api/students/${studentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) {
      console.log("Failed to fetch student:", response.statusText);
      throw new Error("Failed to fetch student" + response.statusText);
    }
    const data = await response.json();
    console.log("Fetched Student:", data);
    setCurrentStudent(data);
    return data;
  };
  // const getRandomStudentIndex = (rounds: { studentsNotAsked: string[] }[]) => {

  // console.log("Current Student Index:", currentStudentIndex);
  // console.log("Students:", students);
  // console.log("Current Student:", currentStudent);

  const handleClassSelect = (classItem: ClassInfo) => {
    setSelectedClass(classItem);
  };

  const handleSubjectSelect = async ({
    subject,
    class: classItem,
  }: {
    subject: any;
    class: any;
  }) => {
    await setSelectedSubject({ subject, class: classItem }); // Schedule the state update
    console.log("Selected Subject:", selectedSubject);
  };

  useEffect(() => {
    if (selectedSubject) {
      handleProceed(); // React to the updated state
      console.log("Selected Subject:", selectedSubject);
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

  const removeStudentFromRound = async (studentId: string) => {
    console.error(rounds);
    if (!rounds[0] || !rounds[0]._id) {
      console.error("No active round found.", rounds);
      toast({
        title: "No active round found",
        description: "Cannot remove student because no round is active.",
        variant: "destructive",
      });
      return;
    }
    console.log("Removing student from round:", studentId);
    const response = await fetch(
      `https://v6xrx50k-5000.inc1.devtunnels.ms/api/rounds/${rounds[0]._id}/students/${studentId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
        credentials: "include",
      }
    );
    if (!response.ok) {
      console.log("Failed to remove student from round:", response.statusText);
      throw new Error(
        "Failed to remove student from round" + response.statusText
      );
    }
    const data = await response.json();
    setRounds(data);
    console.log("Removed Student from Round:", data);
    return data;
  };

  const handleProceed = () => {
    if (selectedSubject && selectedSubject.subject && selectedSubject.class) {
      //if (selectedClass && selectedSubject) {
      console.log("Evaluation started");
      fetchStudents(selectedSubject.class);
      fetchRound(selectedSubject);
      console.log("Students:", students);
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

    if (value === "great") {
      console.log(
        currentStudent,
        selectedSubject?.subject,
        selectedSubject?.class
      );
      // Submit evaluation with mark 2
      submitEvaluation(2);
      handleNext(value);
    }

    // if (value !== "great") {
    //   // setPunishmentModalOpen(true);
    // }
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
    getRandomStudent(rounds);
  };

  const handleNext = async (value: "great" | "good" | "poor") => {
    console.log("Current Evaluation:", value);

    if (value === "great" || currentEvaluation === "great") {
      toast({
        title: "Great evaluation recorded",
        variant: "success",
      });
    }

    removeStudentFromRound(String(currentStudent._id));

    // Move to next student
    getRandomStudent(rounds);
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
    if (!selectedSubject || !currentStudent) return;

    try {
      await fetch(
        `https://v6xrx50k-5000.inc1.devtunnels.ms/api/students/dvtMarks/${currentStudent._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: selectedSubject.subject,
            mark,
            punishment,
          }),
          credentials: "include",
        }
      );

      // Invalidate queries if needed
      // queryClient.invalidateQueries({
      //   queryKey: ["/api/evaluations"],
      // });
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
        selectedSubject={
          selectedSubject?.subject + " " + selectedSubject?.class
        }
        showContext={activeScreen === "evaluation"}
        onHomeClick={handleGoHome}
      />

      <main className="relative">
        {activeScreen === "start" ? (
          <StartScreen
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
            onClassSelect={handleClassSelect}
            onSubjectSelect={handleSubjectSelect}
            onProceed={handleProceed}
            isProceedEnabled={!!selectedSubject}
          />
        ) : (
          <EvaluationScreen
            currentStudent={currentStudent || undefined} //? currentStudent : ()=> getRandomStudentIndex(rounds)
            currentIndex={currentStudentIndex}
            totalStudents={students.length}
            studentsNot={rounds[0]?.studentsNotAsked.length || 0}
            currentEvaluation={currentEvaluation}
            onEvaluate={handleEvaluate}
            onSkip={handleSkip}
            onNext={handleNext}
            onFinish={handleFinish}
            isNextEnabled={!!currentEvaluation && currentEvaluation === "great"}
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
