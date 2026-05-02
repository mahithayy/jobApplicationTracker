import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white py-6 mt-auto">
      <div className="container mx-auto px-4 flex justify-center gap-6 text-sm text-muted-foreground">
        <span className="font-medium text-black">Mahitha Holla</span>
        <Link href="https://github.com/mahithayy" target="_blank" className="hover:text-primary transition-colors">
          GitHub
        </Link>
        <Link href="https://linkedin.com/in/mahitha-holla" target="_blank" className="hover:text-primary transition-colors">
          LinkedIn
        </Link>
      </div>
    </footer>
  );
}