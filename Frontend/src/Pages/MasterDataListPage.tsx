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
  showDelete?: boolean;
  onDelete?: (id: string | number) => void;
}

function DataListView({
  title,
  description,
  items,
  basePath,
  showDelete = false,
  onDelete,
}: DataListViewProps) {
  const navigate = useNavigate();

  const handleItemClick = (id: string | number) => {
    if (!showDelete) {
      navigate(`${basePath}/${id}/edit`);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
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
              onClick={showDelete ? undefined : () => handleItemClick(item.id)}
              className={`flex items-center justify-between p-4 ${
                !showDelete ? "cursor-pointer hover:bg-accent" : ""
              } group`}
            >
              <div>
                <p className="font-medium">{item.name}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
              {showDelete ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => handleDelete(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </Button>
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              )}
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
  products: {
    title: "Products",
    description: "Select a product to view or edit its details.",
    basePath: "/product-master",
    createPath: "/product-master/create",
    fetchData: async () => {
      const response = await axios.get("http://localhost:8000/api/v1/products");
      return response.data.data.map((product: any) => ({
        id: product.id,
        name: product.productName,
        description: `${product.productType} - Sales: ₹${
          product.salesPrice
        } | Purchase: ₹${product.purchasePrice}${
          product.category ? ` | Category: ${product.category.name}` : ""
        }`,
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
  accounts: {
    title: "Accounts",
    description: "Select an account to delete it from the system.",
    basePath: "/chart-of-accounts",
    createPath: "/chart-of-accounts/create",
    showDelete: true,
    fetchData: async () => {
      const response = await axios.get("http://localhost:8000/api/v1/accounts");
      return response.data.data.map((account: any) => ({
        id: account.id,
        name: account.accountName,
        description: `Type: ${account.accountType}`,
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

  const handleDelete = async (id: string | number) => {
    if (
      !confirm(
        "Are you sure you want to delete this account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/v1/accounts/${id}`);
      toast.success("Account deleted successfully!");
      // Refresh the list
      const data = await currentConfig.fetchData();
      setItems(data);
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
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
              <SelectItem value="products">Products</SelectItem>
              <SelectItem value="taxes">Taxes</SelectItem>
              <SelectItem value="accounts">Accounts</SelectItem>
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
          showDelete={currentConfig.showDelete || false}
          onDelete={selectedType === "accounts" ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
