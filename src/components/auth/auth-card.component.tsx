import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn-tools";

export default function AuthCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  className?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("mx-auto w-full max-w-sm shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)]", className)}>
      <CardHeader>
        {!FIREBASE_ENABLED && (
          <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Mode tampilan · Firebase belum terhubung
          </span>
        )}
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
