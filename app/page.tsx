import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F7F8FA] p-4 overflow-hidden">
      {/* Beautiful organic SVG patterns */}
      <svg className="absolute left-[-120px] top-[-120px] w-[500px] h-[500px] z-10" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M300,80 Q400,120 480,220 Q560,320 480,420 Q400,520 300,480 Q200,440 120,340 Q40,240 120,140 Q200,40 300,80Z" fill="#00C853" fillOpacity="0.13" />
      </svg>
      <svg className="absolute right-[-120px] bottom-[-120px] w-[500px] h-[500px] z-10" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M300,520 Q400,480 480,380 Q560,280 480,180 Q400,80 300,120 Q200,160 120,260 Q40,360 120,460 Q200,560 300,520Z" fill="#1DB954" fillOpacity="0.10" />
      </svg>

      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-3xl w-full flex flex-col items-center z-20">
        <Image
          src="/images/heyrafiki-logo.png"
          alt="Heyrafiki Logo"
          width={80}
          height={40}
          className="mb-6"
        />
        <Image
          src="/images/client-banner.png"
          alt="Client Banner"
          width={320}
          height={180}
          className="mb-6"
        />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">Redefining mental healthcare!</h1>
        <p className="text-base text-gray-700 mb-6 text-center">
          Thank you for joining HeyRafiki! We connect you with qualified therapists and a supportive community for your mental health journey.
        </p>
        <Link href="/auth" className="w-full flex justify-center">
          <Button className="w-full md:w-auto px-8 py-3 bg-heyrafiki-green hover:bg-heyrafiki-green-dark text-white font-semibold rounded-2xl text-base shadow-lg transition-all">
            Get Started &rarr;
          </Button>
        </Link>
      </div>
    </div>
  )
}
