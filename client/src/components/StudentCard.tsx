import { type Student } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StudentCardProps {
  student: Student | undefined;
  animate?: boolean;
}

export default function StudentCard({ student, animate = false }: StudentCardProps) {
  if (!student) {
    return (
      <Card className="bg-white rounded-xl shadow-md overflow-hidden mb-6 p-6 flex flex-col items-center">
        <div className="mb-4">
          <Avatar className="w-24 h-24 border-4 border-primary">
            <AvatarFallback>
              <h3>20</h3>
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="w-full text-center">
          <p>Thoufeeque Rahman</p>
          {/* <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-2/3 mx-auto"></div> */}
          <div className="mt-3 w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Roll Number:</span>
              <p>20</p>
              {/* <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div> */}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Admission No.:</span>
              <p>84</p>
              {/* <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div> */}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const getInitials = () => {
    return student.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const animationClass = animate ? 'transform transition-all duration-300' : '';

  return (
    <Card className={`bg-white rounded-xl shadow-md overflow-hidden mb-6 ${animationClass}`}>
      <div className="flex flex-col items-center p-6">
        <div className="mb-4 relative">
          <Avatar className="w-24 h-24 border-4 border-primary">
            {student.photoUrl ? (
              <AvatarImage src={student.photoUrl} alt={student.name} />
            ) : (
              <AvatarFallback>{getInitials()}</AvatarFallback>
            )}
          </Avatar>
        </div>
        <h3 className="text-xl font-bold text-gray-800 text-center">{student.name}</h3>
        <div className="mt-3 w-full space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Roll Number:</span>
            <span className="font-medium text-gray-800">{student.rollNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Admission No.:</span>
            <span className="font-medium text-gray-800">{student.admissionNumber}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
