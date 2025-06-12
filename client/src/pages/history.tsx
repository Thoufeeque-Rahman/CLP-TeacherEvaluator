import { useState, useEffect } from "react";
import Header from "@/components/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  dvtMarks: Array<{
    subject: string;
    mark: number;
    date: string;
    punishment?: string;
  }>;
}

interface SubjectHistory {
  subject: string;
  evaluations: Array<{
    studentName: string;
    rollNumber: string;
    mark: number;
    date: string;
    punishment?: string;
  }>;
}

export default function History() {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [history, setHistory] = useState<SubjectHistory | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Fetch all students when component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/students`, {
          credentials: "include"
        });
        if (!response.ok) throw new Error("Failed to fetch students");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, []);

  // When subject changes, filter and organize the history
  useEffect(() => {
    if (!selectedSubject || !students.length) return;

    const subjectHistory: SubjectHistory = {
      subject: selectedSubject,
      evaluations: []
    };

    students.forEach(student => {
      student.dvtMarks
        .filter(mark => mark.subject === selectedSubject)
        .forEach(mark => {
          subjectHistory.evaluations.push({
            studentName: student.name,
            rollNumber: student.rollNumber,
            mark: mark.mark,
            date: mark.date,
            punishment: mark.punishment
          });
        });
    });

    // Sort by date, most recent first
    subjectHistory.evaluations.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setHistory(subjectHistory);
  }, [selectedSubject, students]);

  const getMarkLabel = (mark: number) => {
    switch (mark) {
      case 0: return "Poor";
      case 1: return "Good";
      case 2: return "Great";
      default: return "Unknown";
    }
  };

  const getMarkColor = (mark: number) => {
    switch (mark) {
      case 0: return "text-red-600";
      case 1: return "text-yellow-600";
      case 2: return "text-green-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="mx-auto max-w-md bg-white min-h-screen shadow-lg relative h-svh flex flex-col">
      <Header showContext={false} onHomeClick={() => {}} />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Evaluation History</h1>
        
        {/* Subject Selection */}
        <div className="mb-6">
          <Select
            value={selectedSubject}
            onValueChange={setSelectedSubject}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {user?.subjectsTaught?.map((subject, index) => (
                <SelectItem key={`${subject}-${index}`} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* History Display */}
        {history && (
          <div className="space-y-4">
            {history.evaluations.map((evaluation, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{evaluation.studentName}</h3>
                      <p className="text-sm text-gray-500">Roll No: {evaluation.rollNumber}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(evaluation.date), "PPp")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${getMarkColor(evaluation.mark)}`}>
                        {getMarkLabel(evaluation.mark)}
                      </p>
                      {evaluation.punishment && (
                        <p className="text-sm text-red-500 mt-1">
                          Punishment: {evaluation.punishment}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {history.evaluations.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No evaluations found for this subject
              </p>
            )}
          </div>
        )}

        {!selectedSubject && (
          <p className="text-center text-gray-500 py-8">
            Select a subject to view evaluation history
          </p>
        )}
      </main>
    </div>
  );
} 