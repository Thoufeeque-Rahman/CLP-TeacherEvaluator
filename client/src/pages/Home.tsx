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
  const [currentStudent, setCurrentStudent] = useState<Student>({} as Student);
  const [punishmentModalOpen, setPunishmentModalOpen] = useState(false);
  const [punishment, setPunishment] = useState<string>();
  const [currentEvaluation, setCurrentEvaluation] = useState<
    "poor" | "good" | "great" | null
  >(null);
  const [students, setStudents] = useState([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const { toast } = useToast();

  const handleProceed = async () => {
    if (selectedSubject && selectedSubject.subject && selectedSubject.class) {
      //if (selectedClass && selectedSubject) {
      console.log("Evaluation started");
      const students = await fetchStudents(selectedSubject.class);
      console.log("Data:", students);
      console.log("Students:", students);
      fetchRound(selectedSubject, students);
      // setActiveScreen("evaluation");
    }
  };

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
    const currentStudent = await getRandomStudent(data);
    setActiveScreen("evaluation");

    console.log("Random Student:", currentStudent);
  };

  // Fetch round based on selected subject and class
  const fetchRound = async (subject: SubjectInfo, students: Student[]) => {
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

    const currentStudent = await getRandomStudent(data);
    setActiveScreen("evaluation");

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
        await fetchStudent(studentsNotAsked[randomIndex]);
        return studentsNotAsked[randomIndex];
      } else {
        increaseRound();
      }
    }
    return null;
  };

  const increaseRound = async () => {
    console.log("Increasing round", rounds[0]);
    const response = await fetch(
      `https://v6xrx50k-5000.inc1.devtunnels.ms/api/rounds/${rounds[0]._id}/increaseRound`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentsNotAsked: students.map((student) => student._id),
        }),
        credentials: "include",

      }
    );
    if (!response.ok) {
      console.log("Failed to increase round:", response.statusText);
      throw new Error("Failed to increase round" + response.statusText);
    }
    const data = await response.json();
    setRounds(data);
    console.log("Increased Round:", data);
    const currentStudent = await getRandomStudent(data);
    setActiveScreen("evaluation");
    console.log("Random Student:", currentStudent);
    return currentStudent;
  }

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
      toast({
        title: "Great evaluation recorded",
      });
      handleNext();
    } else if (value === "good") {
      // Submit evaluation with mark 1
      submitEvaluation(1, punishment);
      toast({
        title: "Good evaluation recorded",
      });
      handleNext();
    } else if (value === "poor") {
      // Submit evaluation with mark 0
      submitEvaluation(0, punishment);
      toast({
        title: "Poor evaluation recorded",
      });
      handleNext();
    }

    // if (value !== "great") {
    //   // setPunishmentModalOpen(true);
    // }
  };

  const handlePunishmentSubmit = (punishment: string) => {
    setPunishment(punishment);
    setPunishmentModalOpen(false);
  };

  const handlePunishmentCancel = () => {
    setPunishmentModalOpen(false);
  };

  const handleSkip = () => {
    // Move to next student
    getRandomStudent(rounds);
  };

  const handleNext = async () => {
    removeStudentFromRound(String(currentStudent._id));

    // Move to next student
    getRandomStudent(rounds);
  };

  const handleFinish = () => {
    // Reset state and go back to start screen
    setActiveScreen("start");
    setCurrentStudentIndex(0);
    setCurrentEvaluation(null);
    setCurrentStudent({} as Student);

    toast({
      title: "Evaluation session completed",
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
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
      toast({
        title: "Failed to save evaluation",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setCurrentEvaluation(null);
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
            setCurrentEvaluation={setCurrentEvaluation}
            onEvaluate={handleEvaluate}
            onSkip={handleSkip}
            onNext={handleNext}
            onFinish={handleFinish}
            setPunishmentModalOpen={setPunishmentModalOpen}
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
