import Image from 'next/image'
import Link from 'next/link'
// random vomment for testing
export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="https://civita.co.uk" passHref>
            <Image 
              src="/gateway.png" 
              alt="Civita Logo" 
              width={100} 
              height={40} 
              className="cursor-pointer"
            />
          </Link>
          <span className="text-sm text-gray-600">
            Incubated by <Link href="https://www.campaignlab.uk">Campaign Lab</Link>
          </span>
        </div>
        <div className="text-sm text-gray-600">
          © 2024 Civita. All rights reserved.
        </div>
      </div>
    </footer>
  )
}