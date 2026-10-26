import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Course } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/utils";
import { Play, ShoppingCart } from "lucide-react";
import Link from "next/link";

type CourseProgressProps = {
  course: Course;
};

export const CourseProgress = ({ course }: CourseProgressProps) => {
  const hasCourse = true;
  const progress = 50;

  return (
    <aside className="bg-muted rounded-2xl p-6 max-h-max sticky top-0">
      {hasCourse ? (
        <>
          <h3 className="text-sm font-bold text-muted-foreground">
            Progresso geral
          </h3>
          <div className="flex items-center gap-2 mt-3">
            <Progress value={progress} />
            <p className="text-xs">{progress}%</p>
          </div>
          <Link href={`/courses/${course.slug}`}>
            <Button className="w-full mt-4 text-xl font-bold h-auto text-white py-3">
              {progress > 0 ? "Continuar assistindo" : "Começar agora"}
              <Play />
            </Button>
          </Link>
        </>
      ) : (
        <div className="flex flex-col items-center text-center gap-2">
          <p className="text-2xl font-bold">Comece agora por apenas</p>
          {!!course.discountPrice && (
            <p className="line-through font-medium text-muted-foreground -mb-2">
              {formatPrice(course.price)}
            </p>
          )}

          <p className="text-4xl font-extrabold text-primary">
            {formatPrice(course.discountPrice ?? course.price)}
          </p>

          <Button className="w-full mt-2 text-xl font-bold h-auto text-white py-3">
            Comprar
            <ShoppingCart />
          </Button>
        </div>
      )}
    </aside>
  );
};
