import type { ReactNode } from "react";

export function AccountSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-black">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">{description}</p>
        ) : null}
      </div>
      <div className="rounded-lg border border-[#EFEFEF] bg-white p-6 shadow-sm">
        {children}
      </div>
    </section>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="mt-8 flex flex-wrap gap-3">{children}</div>;
}

export function PrimaryButton({
  type = "button",
  children,
  disabled,
}: {
  type?: "button" | "submit";
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="inline-flex h-11 items-center justify-center rounded-md bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  type = "button",
  children,
  disabled,
  onClick,
}: {
  type?: "button" | "submit";
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-11 items-center justify-center rounded-md border border-[#E5E5E5] bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2">{children}</div>;
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-11 w-full rounded-md border border-[#CCCCCC] bg-white px-3 text-sm text-black outline-none transition-colors focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] disabled:bg-[#F5F5F5]"
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-11 w-full rounded-md border border-[#CCCCCC] bg-white px-3 text-sm text-black outline-none transition-colors focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]"
    />
  );
}
