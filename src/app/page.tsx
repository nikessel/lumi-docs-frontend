"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome</h1>
        <Link href="/test">
          <Button size="lg" variant="outline">
            View Test Components
          </Button>
        </Link>

      </div>
    </main>
  );
}
