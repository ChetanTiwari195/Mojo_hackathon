import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, PlusCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Helper Component: DataListView (Now in the same file) ---
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

function DataListView({
  title,
  description,
  items,
  basePath,
}: DataListViewProps) {
  const navigate = useNavigate();

  const handleItemClick = (id: string | number) => {
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

// --- Main Page Component: MasterDataListPage ---
const masterDataConfig = {
  contacts: {
    title: "Contacts",
    description: "Select a customer or supplier to view or edit their details.",
    basePath: "/contact-master",
    createPath: "/contact-master/create",
    fetchData: async () => {
      const response = await axios.get("http://localhost:8000/api/v1/contacts");
      return response.data.data.map((contact: any) => ({
        id: contact.id,
        name: contact.contactName,
        description: contact.email || `Phone: ${contact.phone}`,
      }));
    },
  },
  taxes: {
    title: "Taxes",
    description: "Select a tax rate to view or edit its details.",
    basePath: "/tax-master",
    createPath: "/tax-master/create",
    fetchData: async () => {
      const response = await axios.get("http://localhost:8000/api/v1/taxes");
      return response.data.data.map((tax: any) => ({
        id: tax.id,
        name: tax.taxName,
        description: `${tax.value}${
          tax.computationMethod === "percentage" ? "%" : " (Fixed)"
        } - Scope: ${tax.taxScope}`,
      }));
    },
  },
};

type DataType = keyof typeof masterDataConfig;

export function MasterDataListPage() {
  const [selectedType, setSelectedType] = useState<DataType>("contacts");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const config = masterDataConfig[selectedType];
      try {
        const data = await config.fetchData();
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error(`Failed to load ${selectedType}. Please try again.`);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedType]);

  const currentConfig = masterDataConfig[selectedType];

  const handleCreateNew = () => {
    navigate(currentConfig.createPath);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="max-w-xs">
          <Select
            onValueChange={(value: DataType) => setSelectedType(value)}
            defaultValue={selectedType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a data type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contacts">Contacts</SelectItem>
              <SelectItem value="taxes">Taxes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreateNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New {currentConfig.title.slice(0, -1)}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataListView
          title={currentConfig.title}
          description={currentConfig.description}
          items={items}
          basePath={currentConfig.basePath}
        />
      )}
    </div>
  );
}
