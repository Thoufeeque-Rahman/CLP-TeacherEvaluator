import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Student } from "@/types";

interface AskMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onEvaluate: (mark: number) => void;
  subject: string;
  class: number;
}

export function AskMeModal({ isOpen, onClose, student, onEvaluate, subject, class: classNumber }: AskMeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Evaluation for {subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase()} in Class {classNumber}</DialogTitle>
        </DialogHeader>
        
        {/* Student Details */}
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{student.name}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>Roll Number:</div>
              <div>{student.rollNumber}</div>
              <div>Admission Number:</div>
              <div>{student.adNumber}</div>
            </div>
          </div>
        </div>

        {/* Evaluation Buttons */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Evaluate Student:
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <button
              className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-green-50 transition-all"
              onClick={() => {
                onEvaluate(2); // Great
                onClose();
              }}
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
                <span className="text-white text-3xl">🙂</span>
              </div>
              <span className="text-sm font-medium">Great</span>
            </button>

            <button
              className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-yellow-50 transition-all"
              onClick={() => {
                onEvaluate(1); // Good
                onClose();
              }}
            >
              <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center mb-2">
                <span className="text-white text-3xl">😐</span>
              </div>
              <span className="text-sm font-medium">Good</span>
            </button>

            <button
              className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-red-50 transition-all"
              onClick={() => {
                onEvaluate(0); // Poor
                onClose();
              }}
            >
              <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center mb-2">
                <span className="text-white text-3xl">☹️</span>
              </div>
              <span className="text-sm font-medium">Poor</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 