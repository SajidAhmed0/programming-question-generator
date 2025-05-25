"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Exam } from "@/types";
import apiRequest from "@/lib/api-client";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import ShareResultsModal from "@/components/modals/ShareResultsModal";
import { useAuth } from "@/context/AuthContext";

const ProgrammingExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const module = searchParams.get('module');
  const { user } = useAuth();

  type tableData = {
    label: string;
    value: string;
  }[];
  const [tables, setTables] = useState<
  tableData[]
  >([]);

  useEffect(() => {
    console.log("useeffect");
    if (!module) return; // Early return if no module
    if (tables.length > 0) return;
    
    
    const fetchExamList = async (module: string) => {
      try {
        const user_id = user?.uid;
        const result = await apiRequest<Exam[]>(
          `/api/v1/programming/${user_id}/exams/?module=${encodeURIComponent(module)}&status=${true}`,
        );
  
        if (!result.data) {
          toast.error("Something went wrong");
          return;
        }
  
        const data = result.data;

        if (data.length == 0) {
          setTables([]);
          toast.error("No exams found");
          return;
        }
  
        // Calculate tables data based on exams
        const exp_tables = data.map((exam) => [
          { label: "Exam ID", value: exam.id.toString() },
          { label: "Status", value: "Finished" },
          {
            label: "Started",
            value: exam.created_at
              ? format(exam.created_at, "EEEE, d MMMM yyyy, h.mm a")
              : "--",
          },
          {
            label: "Completed",
            value: exam.completed_at
              ? format(exam.completed_at, "EEEE, d MMMM yyyy, h.mm a")
              : "--",
          },
          { label: "Module", value: exam.module },
          { label: "Marks", value: `${exam.student_marks} / ${exam.total_marks}` },
          { label: "Percentage", value: `${exam.student_marks * 5}%` },
          { label: "Difficulty", value: exam.difficulty },
        ]);
  
        setTables(exp_tables);
      } catch (error) {
        toast.error("Failed to fetch exams");
      }
    };
  
    fetchExamList(module);
    console.log("module: " + module);
    console.log("tables: " + tables);
  }, [module]);

  const handleBack = () => {
    router.push(`/quiz?module=${encodeURIComponent(module as string)}`);
  }

  return (
    <div>
        <div className="flex justify-between mb-4 text-lg p-2 bg-gray-300 rounded-md border">
            <p className="p-3 text-lg font-bold">{module}</p>
            <Button
              onClick={handleBack}
              className="mr-6 mt-auto mb-auto"
            >
              <ChevronsLeft className="w-4 h-4" />
              {"Back"}
            </Button>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Card className="w-full p-12">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-medium">
                Completed Exams
              </CardTitle>
            </CardHeader>
            <CardContent >
              <div className="mx-auto ">
                <div className="grid grid-cols-2 gap-4 bg-white overflow-hidden rounded-md border">
                  {tables.length > 0 ?
                    tables.map((tableData) => {
                      return(
                        <div className="m-4 bg-background overflow-hidden rounded-md border" key={tableData[0].value}>
                          <Table >
                            <TableBody>
                              {tableData.map((item) => (
                                <TableRow
                                  key={item.label}
                                  className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r"
                                >
                                  <TableCell className="bg-muted/50 py-2 font-medium text-right">
                                    {item.label}
                                  </TableCell>
                                  <TableCell className="py-2 bg-white">
                                    {item.value}
                                  </TableCell>
                                </TableRow>
                              )
                              )}
                            </TableBody>
                          </Table>
                          <div className="flex justify-center items-center mt-2 mb-2 gap-4 w-sm mx-auto">
                            <Button
                              variant="secondary"
                              className="flex-1"
                              onClick={() => router.push(`/quiz/review?id=${tableData[0].value}`)}
                            >
                              Review Answers
                            </Button>
                            
                          </div>
                        </div>
                      )
                    }) :
                    <p className="p-3 text-lg">No Exams Found</p>
                  }

                  
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default ProgrammingExams;
