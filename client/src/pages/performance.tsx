import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  GraduationCap,
  MessageCircle,
  User,
  Hash,
  Target,
  Trophy,
  Percent,
  ArrowUpDown,
  ChartBar,
  RefreshCw,
} from "lucide-react";
import { getPerformanceColors } from "@/lib/colors";
import { AskMeModal } from "@/components/AskMeModal";
import { useToast } from "@/hooks/use-toast";
import { Student, DvtMark } from "@/types";

interface StudentPerformance {
  student: Student;
  totalQuestions: number;
  totalScore: number;
  percentage: number;
}

type SortField =
  | "rollNumber"
  | "adNumber"
  | "percentage"
  | "name"
  | "totalQuestions";
type SortDirection = "asc" | "desc";

export default function Performance() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [dvtMarks, setDvtMarks] = useState<DvtMark[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<
    StudentPerformance[]
  >([]);
  const [sortField, setSortField] = useState<SortField>("rollNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isAskMeModalOpen, setIsAskMeModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/students`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      console.log(data);
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchDvtMarks = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/dvtmarks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch DVT marks");
      const data = await response.json();
      setDvtMarks(data);
    } catch (error) {
      console.error("Error fetching DVT marks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch DVT marks. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log(selectedSubject);
    fetchStudents();
    fetchDvtMarks();
  }, []);

  // Calculate performance metrics when subject changes
  useEffect(() => {
    if (!selectedSubject || !dvtMarks.length || !students.length) return;
    console.log(dvtMarks);
    console.log(selectedSubject);

    const [subject, classStr] = selectedSubject.split("|");
    const classNum = parseInt(classStr);

    const performance = dvtMarks
      .filter((mark) => mark.subject === subject && mark.class === classNum)
      .reduce((acc: { [key: string]: StudentPerformance }, mark) => {
        const studentId = mark.studentId;
        console.log(mark);
        if (!acc[studentId]) {
          acc[studentId] = {
            student:
              students.find((s) => s._id === studentId) || ({} as Student),
            totalQuestions: 0,
            totalScore: 0,
            percentage: 0,
          };
        }
        acc[studentId].totalQuestions++;
        acc[studentId].totalScore += mark.mark;
        acc[studentId].percentage =
          (acc[studentId].totalScore / (acc[studentId].totalQuestions * 2)) *
          100;
        return acc;
      }, {});

    // Sort based on current sort field and direction
    const performanceArray = Object.values(performance);
    performanceArray.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "rollNumber":
          comparison =
            parseInt(a.student.rollNumber) - parseInt(b.student.rollNumber);
          break;
        case "adNumber":
          comparison =
            parseInt(a.student.adNumber) - parseInt(b.student.adNumber);
          break;
        case "percentage":
          comparison = a.percentage - b.percentage;
          break;
        case "name":
          comparison = a.student.name.localeCompare(b.student.name);
          break;
        case "totalQuestions":
          comparison = a.totalQuestions - b.totalQuestions;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    setStudentPerformance(performanceArray as StudentPerformance[]);
  }, [selectedSubject, dvtMarks, students, sortField, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleAskMeClick = (student: Student) => {
    setSelectedStudent(student);
    setIsAskMeModalOpen(true);
  };

  const handleEvaluate = async (mark: number) => {
    if (!selectedStudent || !user) return;

    const subject = selectedSubject.split("|")[0];
    const classNum = parseInt(selectedSubject.split("|")[1]);

    try {
      const response = await fetch(`${baseUrl}/api/dvtmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          subject: subject,
          adNumber: selectedStudent.adNumber,
          mark,
          class: classNum,
          tId: user?.tId,
        }),
      });
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to save evaluation");
      }

      toast({
        title: "Evaluation Saved",
        description: `Successfully evaluated ${selectedStudent.name} ${response.status}`,
      });

      // Refresh the data
      fetchStudents();
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast({
        title: "Error",
        description: "Failed to save evaluation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([fetchStudents(), fetchDvtMarks()]);
      toast({
        title: "Data Refreshed",
        description: "Successfully refreshed student data and evaluations.",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto max-w-md bg-white min-h-screen shadow-lg relative h-full flex flex-col">
      <Header showContext={false} onHomeClick={() => {}} />
      <main className="flex-1 p-6">
        <div className="flex justify-start items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">
            Performance Board
          </h1>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full bg-blue-50 text-blue-600 font-medium border-blue-600 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-600 focus:bg-blue-100 focus:text-blue-600 focus:border-blue-600 focus:outline-none">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {user?.subjectsTaught?.map((subjectTaught, index) => (
                <SelectItem
                  key={`${subjectTaught.subject}-${subjectTaught.class}-${index}`}
                  value={`${subjectTaught.subject}|${subjectTaught.class}`}
                >
                  {subjectTaught.subject} (Class {subjectTaught.class})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Controls */}
        {selectedSubject && studentPerformance.length > 0 && (
          <div className="mb-6 flex items-center gap-2">
            <Select
              value={sortField}
              onValueChange={(value: SortField) => setSortField(value)}
            >
              <SelectTrigger className="w-40 bg-blue-50 text-blue-600 font-medium border-blue-600 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-600 focus:bg-blue-100 focus:text-blue-600 focus:border-blue-600 focus:outline-none">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="text-blue-600 font-medium">
                    Sort by
                  </SelectLabel>
                  <SelectItem value="rollNumber">Serial Number</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="adNumber">Admission Number</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="totalQuestions">
                    Total Questions
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortDirection}
              className="bg-blue-50 text-blue-600 font-medium border-blue-600 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-600 focus:bg-blue-100 focus:text-blue-600 focus:border-blue-600 focus:outline-none"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {sortDirection === "asc" ? "Ascending" : "Descending"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 font-medium border-blue-600 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-600 focus:bg-blue-100 focus:text-blue-600 focus:border-blue-600 focus:outline-none"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        )}

        {/* Student Performance Cards */}
        <div className="space-y-4">
          {studentPerformance.map((performance) => {
            const colors = getPerformanceColors(performance.percentage);
            return (
              <Card
                key={performance.student._id}
                className={`w-full max-w-md mx-auto border-0 shadow-xl overflow-hidden ${colors.card}`}
              >
                {/* Header Section */}
                <div className={`px-4 py-3 ${colors.header}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1 text-start">
                        <span className="text-white/80 text-xs font-normal">
                          Sl. #{performance.student.rollNumber}
                        </span>
                        <span className="text-white/80 text-xs font-normal">
                          Ad. {performance.student.adNumber}
                        </span>
                      </div>
                      <div className="">
                        <h2 className="text-base font-bold text-white leading-tight">
                          {performance.student.name}
                        </h2>
                      </div>
                    </div>
                    <div
                      className="bg-white/20 px-3 py-1 rounded-full flex items-center text-center gap-2 cursor-pointer hover:bg-white/30 transition-colors justify-end"
                      onClick={() => handleAskMeClick(performance.student)}
                    >
                      <span className="text-white text-sm font-medium">
                        Ask Me
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="px-3 py-4 space-y-2">
                  {/* Performance Metrics */}
                  <div className="bg-white/80 rounded-xl p-4 shadow-sm">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Target className={`w-4 h-4 ${colors.icon}`} />
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Questions
                          </p>
                        </div>
                        <p className="text-lg font-bold text-gray-800">
                          {performance.totalQuestions}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Trophy className={`w-4 h-4 ${colors.icon}`} />
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Score
                          </p>
                        </div>
                        <p className="text-lg font-bold text-gray-800">
                          {performance.totalScore}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <ChartBar className={`w-4 h-4 ${colors.icon}`} />
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Percent
                          </p>
                        </div>
                        <p className={`text-lg font-bold ${colors.text}`}>
                          {performance.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {selectedSubject && studentPerformance.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No performance data found for this subject
            </p>
          )}

          {!selectedSubject && (
            <p className="text-center text-gray-500 py-8">
              Select a subject to view performance data
            </p>
          )}
        </div>
      </main>

      {selectedStudent && (
        <AskMeModal
          isOpen={isAskMeModalOpen}
          onClose={() => setIsAskMeModalOpen(false)}
          student={selectedStudent}
          onEvaluate={handleEvaluate}
          subject={selectedSubject.split("|")[0]}
          class={parseInt(selectedSubject.split("|")[1])}
        />
      )}
    </div>
  );
}
