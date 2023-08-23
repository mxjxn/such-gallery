"use client"
import React from "react";

export default function GalleryLayout ({
children,
}: {
	children:React.ReactNode;
	}) {
	return (
    <div>
	 {children}
   </div>
);
}
