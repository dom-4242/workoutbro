export default function AppFooter() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

  return (
    <footer className="border-t border-gray-800 py-3 px-4 md:px-6">
      <p className="text-center text-xs text-gray-600">
        WorkoutBro{" "}
        <span className="font-mono text-gray-500">v{version}</span>
      </p>
    </footer>
  );
}
