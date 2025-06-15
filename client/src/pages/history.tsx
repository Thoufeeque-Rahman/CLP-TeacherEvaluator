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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, ArrowUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
}

interface DvtMark {
  _id: string;
  studentId: string;
  class: number;
  subject: string;
  mark: number;
  date: string;
  punishment?: string;
}

interface SubjectHistory {
  subject: string;
  evaluations: Array<{
    id: string;
    studentName: string;
    adNumber: string;
    mark: number;
    date: string;
    punishment?: string;
  }>;
}

interface EditDialogProps {
  evaluation: {
    id: string;
    mark: number;
    punishment?: string;
  };
  onSave: (id: string, mark: number, punishment?: string) => Promise<void>;
}

const EditDialog = ({ evaluation, onSave }: EditDialogProps) => {
  const [mark, setMark] = useState(evaluation.mark);
  const [punishment, setPunishment] = useState(evaluation.punishment || "");

  const handleSave = async () => {
    await onSave(evaluation.id, mark, punishment);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Evaluation</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mark</label>
          <Select value={mark.toString()} onValueChange={(value) => setMark(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Poor</SelectItem>
              <SelectItem value="1">Good</SelectItem>
              <SelectItem value="2">Great</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Punishment (optional)</label>
          <input
            type="text"
            value={punishment}
            onChange={(e) => setPunishment(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <DialogClose asChild>
          <Button onClick={handleSave} className="w-full">Save Changes</Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
};

export default function History() {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [history, setHistory] = useState<SubjectHistory | null>(null);
  const [dvtMarks, setDvtMarks] = useState<DvtMark[]>([]);
  const [students, setStudents] = useState<{ [key: string]: Student }>({});
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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
        // Convert array to object with _id as key
        const studentsMap = data.reduce((acc: { [key: string]: Student }, student: Student) => {
          acc[student._id] = student;
          return acc;
        }, {});
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
          credentials: "include"
        });
        if (!response.ok) throw new Error("Failed to fetch DvtMarks");
        const data = await response.json();
        console.log("Fetched DvtMarks:", data);
        setDvtMarks(data);
      } catch (error) {
        console.error("Error fetching DvtMarks:", error);
      }
    };
    fetchDvtMarks();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      const response = await fetch(`${baseUrl}/api/dvtMarks/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}` // Include token in headers
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete evaluation');
      }

      // Update local state
      setDvtMarks(prevMarks => prevMarks.filter(mark => mark._id !== id));
      toast.success("Evaluation deleted successfully");
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete evaluation");
    }
  };

  const handleEdit = async (id: string, mark: number, punishment?: string) => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      const response = await fetch(`${baseUrl}/api/dvtMarks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}` // Include token in headers
        },
        credentials: "include",
        body: JSON.stringify({ mark, punishment }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update evaluation');
      }

      const updatedMark = await response.json();

      // Update local state
      setDvtMarks(prevMarks =>
        prevMarks.map(m => m._id === id ? { ...m, mark, punishment } : m)
      );
      
      toast.success("Evaluation updated successfully");
    } catch (error) {
      console.error("Error updating evaluation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update evaluation");
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  // When subject changes or sort order changes, filter and organize the history
  useEffect(() => {
    if (!selectedSubject || !dvtMarks.length || !Object.keys(students).length) return;

    const [subject, classStr] = selectedSubject.split('|');
    const classNum = parseInt(classStr);

    const subjectHistory: SubjectHistory = {
      subject: subject,
      evaluations: []
    };
    
    const filteredMarks = dvtMarks.filter(mark => 
      mark.subject === subject && mark.class === classNum
    );  

    subjectHistory.evaluations = filteredMarks.map(mark => {
      const student = students[mark.studentId._id];
      console.log(mark.studentId._id); 
      return {
        id: mark._id,
        studentName: student ? student.name : "Unknown Student",
        adNumber: student ? student.adNumber : "N/A",
        mark: mark.mark,
        date: mark.date,
        punishment: mark.punishment
      };
    });

    // Sort by date
    subjectHistory.evaluations.sort((a, b) => {
      const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setHistory(subjectHistory);
  }, [selectedSubject, dvtMarks, students, sortOrder]);

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
    <div className="mx-auto max-w-md bg-white min-h-screen shadow-lg relative h-full flex flex-col">
      <Header showContext={false} onHomeClick={() => {}} />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Evaluation History</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortOrder === "asc" ? "Oldest First" : "Newest First"}
          </Button>
        </div>
        
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

        {/* History Display */}
        {history && (
          <div className="space-y-4">
            {history.evaluations.map((evaluation) => (
              <Card key={evaluation.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{evaluation.studentName}</h3>
                        <p className="text-sm text-gray-500">Admission No: {evaluation.adNumber}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(evaluation.date), "PPp")}
                      </p>
                    </div>
                    <div className="text-right flex items-start gap-4">
                      <div>
                        <p className={`font-medium ${getMarkColor(evaluation.mark)}`}>
                          {getMarkLabel(evaluation.mark)}
                        </p>
                        {evaluation.punishment && (
                          <p className="text-sm text-red-500 mt-1">
                            Punishment: {evaluation.punishment}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                Edit
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <EditDialog
                              evaluation={evaluation}
                              onSave={handleEdit}
                            />
                          </Dialog>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(evaluation.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
