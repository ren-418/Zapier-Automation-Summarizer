'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ThemeSwitcher from './ThemeSwitcher';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Work With Me', href: '/work-with-me' },
    { name: 'Blog', href: '/blog' },
    { name: 'Post', href: '/new' },
    { name: 'Contact', href: '/contact' },
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: 'fb' }, // Placeholder
    { name: 'Twitter', href: '#', icon: 'tw' }, // Placeholder
    { name: 'LinkedIn', href: '#', icon: 'li' }, // Placeholder
  ];

  return (
    <header className="bg-primary text-text shadow-md relative z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo/App Name */}
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
          {/* Placeholder for actual logo icon */}
          <span className="font-sans">Zapier</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-text hover:text-accent font-medium transition-colors duration-200">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Section: Search, Social, Theme Switcher, Mobile Toggle */}
        <div className="flex items-center space-x-4">
          {/* Search Icon */}
          <button aria-label="Search" className="p-2 text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-md">
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>

          {/* Social Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {socialLinks.map((social) => (
              <a key={social.name} href={social.href} aria-label={social.name} className="text-text hover:text-accent transition-colors duration-200">
                {/* Replace with actual social icons later */}
                <div className="h-5 w-5 border border-current rounded-full flex items-center justify-center text-xs">{social.icon}</div>
              </a>
            ))}
          </div>

          {/* Theme Switcher */}
          <div className="hidden md:block">
            <ThemeSwitcher />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-primary z-40 flex flex-col items-center justify-center space-y-8 py-16">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-text hover:text-accent text-3xl font-bold transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center space-x-6 mt-8">
            {socialLinks.map((social) => (
              <a key={social.name} href={social.href} aria-label={social.name} className="text-text hover:text-accent transition-colors duration-200 text-3xl">
                <div className="h-8 w-8 border border-current rounded-full flex items-center justify-center text-base">{social.icon}</div>
              </a>
            ))}
          </div>
          <div className="mt-8">
            <ThemeSwitcher />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;