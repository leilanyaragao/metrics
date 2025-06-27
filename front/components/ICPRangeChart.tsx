import {HistoryItem, Student } from "@/types/dashboard";
import { CardContent } from "./ui/card";
interface PropsICPRangeChart {
  selectedStudents: Student[]
  currentHistoryItem: HistoryItem
}



export function ICPRangeChart({selectedStudents, currentHistoryItem}: PropsICPRangeChart) {
  console.log(selectedStudents)
  return (
    <div>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Turma</span>
            <span className="text-sm font-bold">{currentHistoryItem?.class_average_icp.toFixed(2)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="h-3 rounded-full bg-purple-500" style={{ width: `${currentHistoryItem?.class_average_icp}%` }} />
          </div>
        </div>

        {selectedStudents.map((student) => (
          <div key={student.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{student.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{student.averageICP}%</span>
                <span
                  className={`text-xs ${student.averageICP! > currentHistoryItem?.class_average_icp! ? "text-green-600" : "text-red-600"}`}
                >
                  ({student.averageICP! > currentHistoryItem?.class_average_icp! ? "+" : ""}
                  {(student.averageICP! - currentHistoryItem?.class_average_icp!).toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${student.averageICP! > currentHistoryItem?.class_average_icp! ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${student.averageICP}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </div>
  )
}