import { type Student } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StudentCardProps {
  student: Student | undefined;
  animate?: boolean;
}

export default function StudentCard({
  student,
  animate = false,
}: StudentCardProps) {
  if (!student) {
    return (
      <Card className="bg-white rounded-xl shadow-md h-[420px] overflow-hidden mb-6">
        <div className="grid grid-flow-col grid-rows-1 gap-2 p-6">
          <div className="row-span-3 flex justify-center items-center">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarFallback>
                ?
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="col-span-2">
            <div className="w-full text-center"> 
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-2/3 mx-auto"></div>
              <div className="mt-3 w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Roll Number:</span>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Admission No.:</span>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      // <Card className="bg-white rounded-xl shadow-md overflow-hidden mb-6 p-6 flex flex-col items-center">
      //   <div className="mb-4">
      //     <Avatar className="w-24 h-24 border-4 border-primary">
      //       <AvatarFallback>
      //         <h3>20</h3>
      //       </AvatarFallback>
      //     </Avatar>
      //   </div>
      //   <div className="w-full text-center">
      //     <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-2/3 mx-auto"></div>
      //     <div className="mt-3 w-full space-y-2">
      //       <div className="flex justify-between text-sm">
      //         <span className="text-gray-500">Roll Number:</span>
      //         <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
      //       </div>
      //       <div className="flex justify-between text-sm">
      //         <span className="text-gray-500">Admission No.:</span>
      //         <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
      //       </div>
      //     </div>
      //   </div>
      // </Card>
    );
  }

  const getInitials = () => {
    return student.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const animationClass = animate ? "transform transition-all duration-300" : "";

  const colorClasses = [
    {
      bg: "bg-blue-100",
      border: "border-blue-400"
    },
    {
      bg: "bg-green-100",
      border: "border-green-400"
    },
    {
      bg: "bg-red-100",
      border: "border-red-400"
    },
    {
      bg: "bg-yellow-100",
      border: "border-yellow-400"
    },
    {
      bg: "bg-purple-100",
      border: "border-purple-400"
    },
    {
      bg: "bg-pink-100",
      border: "border-pink-400"
    },
    {
      bg: "bg-orange-100",
      border: "border-orange-400"
    },
  ];

  // Use a deterministic color based on student.rollNumber to avoid repetition on re-render
  const rollNum = Number(student.rollNumber);
  const randomIndex = !isNaN(rollNum)
    ? rollNum % colorClasses.length
    : Math.floor(Math.random() * colorClasses.length);
  const { bg, border } = colorClasses[randomIndex];

  return (
    <Card
      className={`${bg} border-2 ${border} rounded-xl shadow-md overflow-hidden mb-6 ${animationClass}`}
      style={{ height: "180px" }}
    >
      <div className="h-full flex items-center p-6">
        <div className="flex items-center w-full">
          <div className="flex justify-center items-center mr-6">
            <Avatar className="w-24 h-24 border-4 border-primary">
              {student.photoUrl ? (
                <AvatarImage src={student.photoUrl} alt={student.rollNumber} />
              ) : (
                <AvatarFallback>{student.rollNumber}</AvatarFallback>
              )}
            </Avatar>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 text-center">
              {student.name}
            </h3>
            <div className="mt-3 w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Roll Number:</span>
                <span className="font-medium text-gray-800">
                  {student.rollNumber}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Admission No.:</span>
                <span className="font-medium text-gray-800">
                  {student.adNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
    // <Card className={`bg-white rounded-xl shadow-md overflow-hidden mb-6 ${animationClass}`}>
    //   <div className="flex flex-col items-center p-6">
    //     <div className="mb-4 relative">
    //       <Avatar className="w-24 h-24 border-4 border-primary">
    //         {student.photoUrl ? (
    //           <AvatarImage src={student.photoUrl} alt={student.rollNumber} />
    //         ) : (
    //           <AvatarFallback>{student.rollNumber}</AvatarFallback>
    //         )}
    //       </Avatar>
    //     </div>
    //     <h3 className="text-xl font-bold text-gray-800 text-center">{student.name}</h3>
    //     <div className="mt-3 w-full space-y-2">
    //       <div className="flex justify-between text-sm">
    //         <span className="text-gray-500">Roll Number:</span>
    //         <span className="font-medium text-gray-800">{student.rollNumber}</span>
    //       </div>
    //       <div className="flex justify-between text-sm">
    //         <span className="text-gray-500">Admission No.:</span>
    //         <span className="font-medium text-gray-800">{student.adNumber}</span>
    //       </div>
    //     </div>
    //   </div>
    // </Card>
  );
}
