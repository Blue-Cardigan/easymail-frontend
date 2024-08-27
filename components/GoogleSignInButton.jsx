import Image from 'next/image'

export function GoogleSignInButton({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="h-10 flex items-center justify-center hover:opacity-90 transition-opacity"
    >
      <Image
        src="/googlebutton/rectangle.svg"
        alt="Continue with Google"
        width={240}
        height={40}
        className="cursor-pointer w-auto h-full"
      />
    </button>
  )
}