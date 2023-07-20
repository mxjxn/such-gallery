"use client"
import Image from 'next/image'
import SubmitArt from '../components/SubmitArt'
import { useProfile } from '@/hooks/useProfile';

export default function Home() {
	const { user } = useProfile();
	console.log("main page!", { user });
  return (
    <main className="">
			{/* Latest Chronological Submissions */}
			{/* Curate */}
			{/* Curated Galleries */}
			{/* Events */}
		</main>
  )
}
