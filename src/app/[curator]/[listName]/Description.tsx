"use client" 

import { useProfile } from "@/hooks/useProfile";
import _ from "lodash";
import React from "react";
// import { comicNeue } from "@/fonts";


export default function Description({
	description,
}: {
	description: string;
}) {
  const lines: string[] = description.split("\n");
  return (
    <div className="flex flex-col justify-around text-xs mx-5">
      {_.map(lines, (line) => (
        <div className="mt-3">{line}</div>
      ))}
    </div>
  );
}

