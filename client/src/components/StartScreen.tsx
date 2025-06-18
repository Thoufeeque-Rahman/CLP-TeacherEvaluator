import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";
import { ClassInfo, SubjectInfo } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import DvtMarksTable from "./DvtMarksTable";

interface StartScreenProps {
  selectedClass: ClassInfo | null;
  selectedSubject: SubjectInfo | null;
  onClassSelect: (classItem: ClassInfo) => void;
  onSubjectSelect: (subject: SubjectInfo) => void;
  onProceed: () => void;
  isProceedEnabled: boolean;
}

export default function StartScreen({
  selectedClass,
  selectedSubject,
  onClassSelect,
  onSubjectSelect,
  onProceed,
  isProceedEnabled,
}: StartScreenProps) {
  const { user, isAuthenticated } = useAuth();
  const [dvtMarks, setDvtMarks] = useState<any[]>([]);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchDvtMarks();
  }, []);

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  const fetchDvtMarks = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/dvtmarks/dvtmarksbydate`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch DVT marks");
      const data = await response.json();
      console.log(data.data);
      setDvtMarks(data.data);
    } catch (error) {
      console.error("Error fetching DVT marks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch DVT marks. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 transition-all duration-300 transform">
      <div className="text-center mb-8 mt-4">
        <div className="bg-blue-500 inline-block p-3 rounded-full mb-4">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-blue-600">Daily Viva Tracker</h2>
        <p className="font-medium mt-2 text-blue-600">
          Hi, {user?.name.toUpperCase()}
        </p>
      </div>

      {/* Subject Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Lesson
        </label>
        <div className="grid grid-cols-2 gap-3">
          {user?.subjectsTaught?.map((subject, index) => (
            <button
              key={index}
              className={`border border-gray-200 rounded-lg py-3 px-4 text-center hover:bg-gray-50 focus:outline-none transition-all`}
              style={{
                backgroundColor: `hsl(${(index * 40) % 360}, 70%, 90%)`,
                borderColor: `hsl(${(index * 40) % 360}, 70%, 50%)`,
              }}
              onClick={() => {
                onSubjectSelect({
                  subject: subject.subject,
                  class: subject.class,
                });
              }}
            >
              {subject.subject} - {subject.class}
            </button>
          ))}
        </div>
      </div>

      <DvtMarksTable />
    </div>
  );
}
