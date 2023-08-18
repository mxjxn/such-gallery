"use client"
import React from "react";

export default function CuratorComment({
  comment,
  curationId,
}: {
  comment: string;
  curationId: string;
}) {
  return <div>{comment}</div>;
}
