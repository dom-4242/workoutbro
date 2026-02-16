import { getExercises } from "@/lib/actions/exercise";
import ExercisesClient from "./ExercisesClient";

export default async function AdminExercisesPage() {
  const exercises = await getExercises();

  return <ExercisesClient exercises={exercises} />;
}
