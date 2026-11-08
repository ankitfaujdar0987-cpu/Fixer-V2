import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function Categories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("id");

  if (error) {
    return <p className="text-red-600">Error: {error.message}</p>;
  }

  return (
    <ul className="list-disc pl-5">
      {data?.map((c) => (
        <li key={c.id}>{c.name}</li>
      ))}
    </ul>
  );
}

// Temporary page to test the database connection. We delete it later.
export default function TestDb() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-4 text-2xl font-extrabold">Database test</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <Categories />
      </Suspense>
    </main>
  );
}