"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useSearchParams } from "next/navigation";
import { getQuizResult } from "@/actions/results";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { getQuizGrade, getQuizMarks } from "@/lib/quiz-utils";
import { Copy, Download, Share2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas-pro";
import { getUserNameByUid } from "@/actions/user";
import { ExamAndQuestions } from "@/types";
import apiRequest from "@/lib/api-client";

const ShareResultsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareText, setShareText] = useState("");
  const [tableData, setTableData] = useState<
    { label: string; value: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const resultPreviewRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  function getDuration(created_at : string, completed_at : string) {
    // Convert inputs to timestamps (handles ISO strings, Date objects, or numbers)
    const startTime = new Date(created_at).getTime();
    const endTime = new Date(completed_at).getTime();
  
    // Calculate difference in milliseconds
    const diffMs = endTime - startTime;
  
    // Handle negative differences (if completed_at is before created_at)
    const absDiffMs = Math.abs(diffMs);
  
    // Calculate time components
    const seconds = Math.floor(absDiffMs / 1000) % 60;
    const minutes = Math.floor(absDiffMs / (1000 * 60)) % 60;
    const hours = Math.floor(absDiffMs / (1000 * 60 * 60)) % 24;
    const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
  
    // Build human-readable parts
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);
  
    // Handle zero duration (e.g., "0s")
    const formattedDuration = parts.length > 0 ? parts.join(' ') : '0s';
  
    // Add negative sign if end time is before start time
    return diffMs < 0 ? `-${formattedDuration}` : formattedDuration;
  }


  useEffect(() => {
    if (isOpen && id) {
      console.log(id);
      // Set the share link
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/quiz/result?id=${id}`;

      // Fetch quiz result data for preview
      const fetchQuizResult = async () => {
        // if (user?.uid && id) {
        if (id) {
          setIsLoading(true);
          try {
            // const result = await getQuizResult(id);

            const user_id = user?.uid;
        
            const result = await apiRequest<ExamAndQuestions>(
              `/api/v1/programming/${user_id}/exams/${id}/`,
            );

            if (result.data) {
              const data = result.data;

              // Create table data for preview
              setTableData([
                // { label: "Name", value: await getUserNameByUid(user?.uid) },
                { label: "Exam ID", value: data?.exam.id.toString() },
                { label: "Status", value: "Finished" },
                {
                  label: "Completed",
                  value: data?.exam.completed_at
                    ? format(data?.exam.completed_at, "EEEE, d MMMM yyyy")
                    : "--",
                },
                // { label: "Duration", value: data?.timeSpent },
                { label: "Duration", value: getDuration(data?.exam.created_at, data?.exam.completed_at) || "0" },
                { label: "Module", value: data?.exam.module },
                { label: "Marks", value: `${data?.exam.student_marks} / ${data?.exam.total_marks}` },
                { label: "Percentage", value: `${data?.exam.student_marks * 5}%` },
                { label: "Difficulty", value: data?.exam.difficulty },
                // { label: "Marks", value: getQuizMarks(data?.feedback || []) },
                // { label: "Grade", value: getQuizGrade(data?.feedback || []) },
                // { label: "Difficulty", value: data?.difficulty },
              ]);

              // Create share text
              setShareText(
                `I just completed a quiz! Check out my results: ${shareUrl}`
              );
            }
          } catch (error) {
            console.error("Error fetching quiz result:", error);
            toast.error("Failed to load quiz results");
          } finally {
            setIsLoading(false);
          }
        }
      };

      fetchQuizResult();
    }
  }, [isOpen, id, user?.uid]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadImage = async () => {
    if (resultPreviewRef.current) {
      setIsDownloading(true);
      try {
        const canvas = await html2canvas(resultPreviewRef.current);
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "quiz-result.png";
        link.click();
        toast.success("Image downloaded!");
      } catch (error) {
        toast.error("Failed to download image");
        console.error("Error generating image:", error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="flex-1">
          <Share2 className="mr-2 h-4 w-4" />
          Share Results
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Results</DialogTitle>
          <DialogDescription>
            Share your quiz results with friends and family.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading results...</p>
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {/* Results Preview */}
            <div
              ref={resultPreviewRef}
              className="border rounded-md p-4 bg-white"
            >
              <h3 className="text-xl font-semibold text-center mb-4">
                Quiz Results
              </h3>
              <Table>
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
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Download Image Section */}
            <Button
              onClick={downloadImage}
              disabled={isDownloading}
              variant="outline"
              className="w-full"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download as Image
                </>
              )}
            </Button>

            {/* Share Text Section */}
            <div className="mt-4">
              <h4 className="text-sm font-medium flex items-center">
                <Share2 className="h-4 w-4 mr-2" />
                Share Text
              </h4>
              <div className="p-3 bg-muted rounded-md text-sm mb-2">
                {shareText}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => copyToClipboard(shareText)}
              >
                <Copy className="mr-2 h-3 w-3" />
                Copy Text
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareResultsModal;
