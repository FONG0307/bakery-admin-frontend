import { Suspense } from "react";
import RestoreForm from "./RestoreForm";

export default function RestoreAccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestoreForm />
    </Suspense>
  );
}
