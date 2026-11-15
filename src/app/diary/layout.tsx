export default function DiaryLayout({ children }: LayoutProps<"/diary">) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-20 pt-12 sm:px-6">
      {children}
    </div>
  );
}
