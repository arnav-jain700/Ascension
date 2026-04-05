"use client";

import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  baseUrl: string;
}

export function Pagination({ currentPage, totalPages, hasNext, hasPrev, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set("page", page.toString());
    return url.pathname + url.search;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous button */}
      {hasPrev ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-asc-border rounded-md text-asc-charcoal hover:border-asc-accent hover:text-asc-accent transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Previous
        </Link>
      ) : (
        <div className="flex items-center gap-1 px-3 py-2 text-sm border border-asc-border rounded-md text-asc-charcoal opacity-50 cursor-not-allowed">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Previous
        </div>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isCurrentPage = page === currentPage;
          const isNearCurrent = Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
          
          if (!isNearCurrent && page !== 1 && page !== totalPages) {
            if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span key={page} className="px-2 text-asc-charcoal">
                  ...
                </span>
              );
            }
            return null;
          }

          return (
            <Link
              key={page}
              href={createPageUrl(page)}
              className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                isCurrentPage
                  ? "border-asc-accent bg-asc-accent text-asc-canvas"
                  : "border-asc-border text-asc-charcoal hover:border-asc-accent hover:text-asc-accent"
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Next button */}
      {hasNext ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-asc-border rounded-md text-asc-charcoal hover:border-asc-accent hover:text-asc-accent transition-colors"
        >
          Next
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      ) : (
        <div className="flex items-center gap-1 px-3 py-2 text-sm border border-asc-border rounded-md text-asc-charcoal opacity-50 cursor-not-allowed">
          Next
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      )}
    </div>
  );
}
