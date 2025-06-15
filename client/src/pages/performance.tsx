import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
} from "lucide-react";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  adNumber: string;
}

interface DvtMark {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    rollNumber: string;
    adNumber: string;
  };
  class: number;
  subject: string;
  mark: number;
  date: string;
  punishment?: string;
}

interface StudentPerformance {
  student: Student;
  totalQuestions: number;
  totalScore: number;
  percentage: number;
}

type SortField = "rollNumber" | "adNumber" | "percentage";
type SortDirection = "asc" | "desc";

export default function Performance() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [students, setStudents] = useState<{ [key: string]: Student }>({});
  const [dvtMarks, setDvtMarks] = useState<DvtMark[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<
    StudentPerformance[]
  >([]);
  const [sortField, setSortField] = useState<SortField>("percentage");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Fetch all students when component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/students`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch students");
        const data = await response.json();
        const studentsMap = data.reduce(
          (acc: { [key: string]: Student }, student: Student) => {
            acc[student._id] = student;
            return acc;
          },
          {}
        );
        setStudents(studentsMap);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, []);

  // Fetch all DvtMarks when component mounts
  useEffect(() => {
    const fetchDvtMarks = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/dvtMarks`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch DvtMarks");
        const data = await response.json();
        setDvtMarks(data);
      } catch (error) {
        console.error("Error fetching DvtMarks:", error);
      }
    };
    fetchDvtMarks();
  }, []);

  // Calculate performance metrics when subject changes
  useEffect(() => {
    if (!selectedSubject || !dvtMarks.length || !Object.keys(students).length)
      return;

    const [subject, classStr] = selectedSubject.split("|");
    const classNum = parseInt(classStr);

    const filteredMarks = dvtMarks.filter(
      (mark) => mark.subject === subject && mark.class === classNum
    );

    // Group marks by student
    const studentMarks = filteredMarks.reduce(
      (acc: { [key: string]: DvtMark[] }, mark) => {
        const studentId = mark.studentId._id;
        if (!acc[studentId]) {
          acc[studentId] = [];
        }
        acc[studentId].push(mark);
        return acc;
      },
      {}
    );

    // Calculate performance metrics for each student
    const performance = Object.entries(studentMarks).map(
      ([studentId, marks]) => {
        const totalQuestions = marks.length;
        const totalScore = marks.reduce((sum, mark) => sum + mark.mark, 0);
        const percentage = (totalScore / (totalQuestions * 2)) * 100; // Each question has max 2 marks

        return {
          student: students[studentId],
          totalQuestions,
          totalScore,
          percentage,
        };
      }
    );

    // Sort based on current sort field and direction
    performance.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "rollNumber":
          comparison = parseInt(a.student.rollNumber) - parseInt(b.student.rollNumber);
          break;
        case "adNumber":
          comparison = parseInt(a.student.adNumber) - parseInt(b.student.adNumber);
          break;
        case "percentage":
          comparison = a.percentage - b.percentage;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    setStudentPerformance(performance);
  }, [selectedSubject, dvtMarks, students, sortField, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleAskMeClick = (student: Student) => {
    setLocation(
      `/evaluation?student=${student._id}&subject=${selectedSubject}`
    );
  };

  return (
    <div className="mx-auto max-w-md bg-white min-h-screen shadow-lg relative h-full flex flex-col">
      <Header showContext={false} onHomeClick={() => {}} />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">Performance Board</h1>

        {/* Subject Selection */}
        <div className="mb-4">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full bg-blue-50 text-blue-600 font-medium border-blue-600 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-600 focus:bg-blue-100 focus:text-blue-600 focus:border-blue-600 focus:outline-none ">
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
            <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
              <SelectTrigger className="w-40 bg-blue-50 text-blue-600 font-medium border-blue-600 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-600 focus:bg-blue-100 focus:text-blue-600 focus:border-blue-600 focus:outline-none">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger> 
              <SelectContent>
                <SelectItem value="rollNumber">Roll Number</SelectItem>
                <SelectItem value="adNumber">Admission No</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
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
          </div>
        )}

        {/* Student Performance Cards */}
        <div className="space-y-4">
          {studentPerformance.map((performance) => (
            <Card
              key={performance.student._id}
              className={`w-full max-w-md mx-auto border-0 shadow-xl overflow-hidden ${
                performance.percentage >= 80
                  ? "bg-gradient-to-br from-blue-50 to-indigo-100"
                  : performance.percentage >= 50
                  ? "bg-gradient-to-br from-amber-50 to-orange-100"
                  : "bg-gradient-to-br from-red-50 to-orange-100"
              }`}
            >
              {/* Header Section */}
              <div
                className={`px-4 py-3 ${
                  performance.percentage >= 80
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                    : performance.percentage >= 50
                    ? "bg-gradient-to-r from-amber-600 to-orange-600"
                    : "bg-gradient-to-r from-red-600 to-orange-600"
                }`}
              >
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
                  {performance.percentage < 50 && (
                    <div
                      className="bg-white/20 px-3 py-1 rounded-full flex items-center text-center gap-2 cursor-pointer hover:bg-white/30 transition-colors justify-end"
                      onClick={() => handleAskMeClick(performance.student)}
                    >
                      <span className="text-white text-sm font-medium">
                        Ask Me
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="px-3 py-4 space-y-2">
                {/* Performance Metrics */}
                <div className="bg-white/80 rounded-xl p-4 shadow-sm">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Target
                          className={`w-4 h-4 ${
                            performance.percentage >= 80
                              ? "text-blue-600"
                              : performance.percentage >= 50
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        />
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
                        <Trophy
                          className={`w-4 h-4 ${
                            performance.percentage >= 80
                              ? "text-blue-600"
                              : performance.percentage >= 50
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        />
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
                        <Percent
                          className={`w-4 h-4 ${
                            performance.percentage >= 80
                              ? "text-blue-600"
                              : performance.percentage >= 50
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        />
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Percent
                        </p>
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          performance.percentage >= 80
                            ? "text-blue-600"
                            : performance.percentage >= 50
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {performance.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

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
    </div>
  );
}
