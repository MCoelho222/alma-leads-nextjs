'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function ThankYou() {
  const router = useRouter()

  return (
    <div className="text-center mt-20 px-4">
      <Image
        src="/icons/file-icon.png"
        alt="Info document"
        width={64}
        height={64}
        className="mx-auto mb-4"
      />
      <h1 className="text-3xl font-bold mb-4">Thank you!</h1>
      <p className="text-gray-600 font-bold mb-8 ">Your information was submitted to our team of imigration attorneys. Expect an e-mail from hello@tryalma.ai.</p>
      <button
        onClick={() => router.push('/')}
        className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
      >
        Go back to Homepage
      </button>
    </div>
  )
}
