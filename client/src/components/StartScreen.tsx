import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";
import { ClassInfo, SubjectInfo } from "@/pages/Home";

interface StartScreenProps {
  classes: ClassInfo[];
  subjects: SubjectInfo[];
  selectedClass: ClassInfo | null;
  selectedSubject: SubjectInfo | null;
  onClassSelect: (classItem: ClassInfo) => void;
  onSubjectSelect: (subject: SubjectInfo) => void;
  onProceed: () => void;
  isProceedEnabled: boolean;
}

export default function StartScreen({
  classes,
  subjects,
  selectedClass,
  selectedSubject,
  onClassSelect,
  onSubjectSelect,
  onProceed,
  isProceedEnabled,
}: StartScreenProps) {
  const onProceedNext = (subject: SubjectInfo) => {
    onProceed;
    onSubjectSelect(subject);
    console.log("Selected Subject:", subject);
    console.log(isProceedEnabled);
  };
  return (
    <div className="p-6 transition-all duration-300 transform">
      <div className="text-center mb-8 mt-4">
        <div className="bg-primary inline-block p-3 rounded-full mb-4">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Teacher Evaluation</h2>
        <p className="text-gray-600 mt-2">Select class and subject to begin</p>
      </div>

      {/* Class Selection */}
      {/* <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
        <div className="grid grid-cols-2 gap-3">
          {classes.map((classItem) => (
            <button
              key={classItem.id}
              className={`border border-gray-200 rounded-lg py-3 px-4 text-center hover:bg-gray-50 focus:outline-none transition-all ${
                selectedClass?.id === classItem.id ? 'ring-2 ring-primary bg-blue-50' : ''
              }`}
              onClick={() => onClassSelect(classItem)}
            >
              {classItem.name}
            </button>
          ))}
        </div>
      </div> */}

      {/* Subject Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Subject
        </label>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((subject, index) => (
            <button
              key={subject.id}
              className={`border border-gray-200 rounded-lg py-3 px-4 text-center hover:bg-gray-50 focus:outline-none transition-all ${
                selectedSubject?.id === subject.id
                  ? "ring-2 ring-primary bg-blue-50"
                  : ""
              }`}
              style={{
                backgroundColor: `hsl(${(index * 40) % 360}, 70%, 90%)`,
                borderColor: `hsl(${(index * 40) % 360}, 70%, 50%)`,

              }}
              onClick={() => {
                onSubjectSelect(subject);
                // onProceed();
              }}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>

      {/* Proceed Button */}
      {/* <Button
        className="w-full py-4 px-4 rounded-lg text-white font-bold shadow-md transition-all"
        disabled={!isProceedEnabled}
        onClick={onProceed}
      >
        <div className="flex items-center justify-center">
          <span>Begin Evaluation</span>
          <ArrowRight className="ml-2 w-4 h-4" />
        </div>
      </Button> */}
    </div>
  );
}
