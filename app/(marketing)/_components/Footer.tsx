import { Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { navigation, social } from "../data";

export function Footer() {
  return (
    <footer className="relative border-t border-zinc-200/50 bg-white/50 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand */}
          <div className="space-y-8">
            <Link href="/" className="group flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-500/25 transition-transform duration-300 group-hover:scale-110">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                Inbox Zero
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              AI-powered email management that helps you achieve inbox zero
              without the stress. Focus on what matters.
            </p>
            <div className="flex gap-4">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                  aria-label={item.name}
                >
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Product
                </h3>
                <ul className="mt-4 space-y-3">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Company
                </h3>
                <ul className="mt-4 space-y-3">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Resources
                </h3>
                <ul className="mt-4 space-y-3">
                  {navigation.resources.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Legal
                </h3>
                <ul className="mt-4 space-y-3">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Subscribe to our newsletter
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Get productivity tips and product updates. No spam.
              </p>
            </div>
            <form className="flex w-full gap-3 sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
                />
              </div>
              <button
                type="submit"
                className="h-10 rounded-lg bg-linear-to-r from-violet-600 to-blue-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800 sm:flex-row">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} Inbox Zero. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-500">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            {""}All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
