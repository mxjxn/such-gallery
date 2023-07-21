"use client"
import Image from 'next/image'
import SubmitArt from '../components/SubmitArt'
import { useProfile } from '@/hooks/useProfile';
import { useEffect } from 'react';

export default function Home() {
	const { user } = useProfile();
	useEffect(() => {
			console.log("main page!", { user });
	}, [user]);
  return (
    <main className="">
			{/* Latest Chronological Submissions */}
			{/* Curate */}
			{/* Curated Galleries */}
			{/* Events */}
		</main>
  )
}
