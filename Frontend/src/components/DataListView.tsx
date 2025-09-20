import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ListItem {
  id: string | number;
  name: string;
  description?: string;
}

interface DataListViewProps {
  title: string;
  description: string;
  items: ListItem[];
  basePath: string;
}

export function DataListView({
  title,
  description,
  items,
  basePath,
}: DataListViewProps) {
  const navigate = useNavigate();

  const handleItemClick = (id: string | number) => {
    // This correctly navigates to the edit page (e.g., /contact-master/c001/edit)
    navigate(`${basePath}/${id}/edit`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent group"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          ))}
          {items.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">
              No data found.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
