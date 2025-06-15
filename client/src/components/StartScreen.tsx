import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";
import { ClassInfo, SubjectInfo } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";

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

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="p-6 transition-all duration-300 transform">
      <div className="text-center mb-8 mt-4"> 
        <div className="bg-blue-500 inline-block p-3 rounded-full mb-4">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-blue-600">
          Daily Viva Tracker
        </h2>
        <p className="text-gray-600">
          Select a lesson to begin
        </p>
        <p className="font-medium mt-2 text-blue-600">Hey, {user?.name.toUpperCase()}</p>
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
                onSubjectSelect({ subject: subject.subject, class: subject.class });
              }}
            >
              {subject.subject} - Class {subject.class}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
