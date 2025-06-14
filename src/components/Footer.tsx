import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-primary text-text border-t border-border mt-12 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between md:flex-row space-y-4 md:space-y-0">
        <div className="text-sm text-tertiary">
          © {new Date().getFullYear()} Zapier. Powered by <Link href="https://wix.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-accent">Wix</Link> (as per design reference).
        </div>
        <div className="flex space-x-6">
          {/* Placeholder for social icons if needed, or remove if only GitHub link is desired */}
          <a
            href="https://github.com/your-github-profile" // Replace with your actual GitHub profile
            target="_blank"
            rel="noopener noreferrer"
            className="text-tertiary hover:text-accent transition-colors duration-200 text-sm"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;