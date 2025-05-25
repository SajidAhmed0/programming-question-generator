import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
interface AssignedLevelModalProps {
  level: string;
  isOpen: boolean;
  handleClose: () => void;
}

const AssignedLevelModal = ({
  level,
  isOpen,
  handleClose,
}: AssignedLevelModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Congratulations!</DialogTitle>
        </DialogHeader>
        <p>
          You have been assigned the level{" "}
          <span className="font-bold">{level}</span> of the quiz.
        </p>
        <Button onClick={handleClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
};

export default AssignedLevelModal;
