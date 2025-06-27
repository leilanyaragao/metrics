import React, { useState, useMemo } from "react";
import { Check, Users, X, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User } from "../types/chart-data";
import { Student } from "@/types/dashboard";

interface StudentSelectorProps {
  students: User[];
  selectedStudents: Student[];
  onStudentsChange: (students: Student[]) => void;
}

// Gerador de cores HSL para garantir cores distintas
const generateColor = (index: number): string => {
  const goldenRatio = 0.618033988749895;
  const hue = (index * goldenRatio) % 1;
  return `hsl(${Math.floor(hue * 360)}, 70%, 50%)`;
};

export function StudentSelector({
  students,
  selectedStudents,
  onStudentsChange,
}: StudentSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar estudantes baseado na busca
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    return students.filter((student) =>
      student.user_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [students, searchTerm]);

  const handleStudentToggle = (student: User, checked: boolean) => {
    if (checked) {
      const newStudent: Student = {
        id: student.user_id,
        name: student.user_name,
        averageICP: student.user_average_icp,
        averageRPP: student.user_average_rpp,
        averageGAP: student.user_average_gap,
        color: generateColor(selectedStudents.length),
      };
      onStudentsChange([...selectedStudents, newStudent]);
    } else {
      onStudentsChange(
        selectedStudents.filter((s) => s.id !== student.user_id),
      );
    }
  };

  const handleSelectAll = () => {
    const studentsToAdd = filteredStudents.filter(
      (student) =>
        !selectedStudents.some((selected) => selected.id === student.user_id),
    );

    const newStudents = studentsToAdd.map((student, index) => ({
      id: student.user_id,
      name: student.user_name,
      color: generateColor(selectedStudents.length + index),
    }));

    onStudentsChange([...selectedStudents, ...newStudents]);
  };

  const handleClearAll = () => onStudentsChange([]);

  const removeStudent = (studentId: string) => {
    onStudentsChange(selectedStudents.filter((s) => s.id !== studentId));
  };

  const isStudentSelected = (studentId: string) =>
    selectedStudents.some((s) => s.id === studentId);

  return (
    <div className="w-full space-y-4">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        <Users className="inline h-4 w-4 mr-1" />
        Selecionar Alunos ({students.length} disponíveis)
      </label>

      <div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            {selectedStudents.length === 0
              ? "Escolher alunos..."
              : `${selectedStudents.length} aluno${selectedStudents.length !== 1 ? "s" : ""} selecionado${selectedStudents.length !== 1 ? "s" : ""}`}
          </div>
          <ChevronDown
            className={`ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </Button>

        {isExpanded && (
          <div className="mt-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 p-4 space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={`Buscar entre ${students.length} alunos...`}
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="pl-10 h-8"
              />
            </div>

            {/* Botões de ação rápida */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex-1 h-8 text-xs"
                disabled={filteredStudents.every((s) =>
                  isStudentSelected(s.user_id),
                )}
              >
                <Check className="h-3 w-3 mr-1" />
                Todos filtrados
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="flex-1 h-8 text-xs"
                disabled={selectedStudents.length === 0}
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            </div>

            {/* Lista de estudantes */}
            <div className="max-h-80 overflow-y-auto space-y-1">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                  Nenhum aluno encontrado
                </div>
              ) : (
                <div>
                  {searchTerm && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {filteredStudents.length} resultado
                      {filteredStudents.length !== 1 ? "s" : ""} para "
                      {searchTerm}"
                    </p>
                  )}
                  {filteredStudents.map((student) => {
                    const isSelected = isStudentSelected(student.user_id);
                    const selectedStudent = selectedStudents.find(
                      (s) => s.id === student.user_id,
                    );

                    return (
                      <div
                        key={student.user_id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        onClick={() =>
                          handleStudentToggle(student, !isSelected)
                        }
                      >
                        <Checkbox checked={isSelected} />

                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {student.user_name}
                          </div>
                        </div>

                        {isSelected && selectedStudent && (
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                            style={{ backgroundColor: selectedStudent.color }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Estudantes selecionados */}
      {selectedStudents.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Selecionados ({selectedStudents.length}):
          </div>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {selectedStudents.map((student) => {
              const studentData = students.find(
                (s) => s.user_id === student.id,
              );

              return (
                <Badge
                  key={student.id}
                  variant="secondary"
                  className="text-xs px-2 py-1 group cursor-pointer hover:opacity-80 flex items-center gap-1"
                  style={{
                    backgroundColor: `${student.color}15`,
                    color: student.color,
                    borderColor: `${student.color}30`,
                  }}
                  onClick={() => removeStudent(student.id)}
                  title={`${student.name}${
                    studentData
                      ? ` - ICP: ${studentData.user_average_icp.toFixed(1)}%`
                      : ""
                  } - Clique para remover`}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: student.color }}
                  />
                  <span className="truncate max-w-20">
                    {student.name.split(" ")[0]}
                  </span>
                  <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Badge>
              );
            })}
          </div>
          {selectedStudents.length > 10 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              💡 Dica: Para melhor visualização, considere selecionar menos
              alunos
            </p>
          )}
        </div>
      )}
    </div>
  );
}
