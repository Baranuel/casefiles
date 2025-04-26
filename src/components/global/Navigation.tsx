import Image from "next/image";
import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="flex justify-between items-center p-4 w-full bg-background-700 text-white">
      <Link href='/' className="flex items-center gap-2 font-semibold text-lg">
        <Image src={'/logo.png'} alt='logo' width={24} height={24}/>
         <span>Casefiles</span>
      </Link>

      <ul>
        <li>
          <Link href="/cases" className="font-bold">
            Cases
          </Link>
        </li>
      </ul>
    </nav>
  );
}
