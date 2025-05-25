"use client";

import * as React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useUserStore from "@/store/user";
import "react-circular-progressbar/dist/styles.css";
const percentage = 56;

function CurrentProgress() {
  const { userLevel } = useUserStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="flex justify-center items-center w-42 h-42 mx-auto">
          <CircularProgressbar
            value={percentage}
            text={`${percentage}%`}
            strokeWidth={12}
            styles={{
              path: {
                strokeLinecap: "unset",
              },
              text: {
                fill: "var(--color-primary)",
                fontSize: "1rem",
              },
            }}
          />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <p>
          Level: <span className="font-bold">{userLevel}</span>
        </p>
      </CardFooter>
    </Card>
  );
}

export default CurrentProgress;
