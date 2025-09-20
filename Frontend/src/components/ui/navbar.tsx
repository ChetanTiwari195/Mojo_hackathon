import React from "react";
import { useNavigate } from "react-router-dom";
import { CircleUser, Menu, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

// Reusable ListItem component for NavigationMenu
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {

  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

// Main Dashboard Navbar Component
function DashboardNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      {/* Desktop Navigation */}
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <a
          href="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Acme Inc</span>
        </a>
        <NavigationMenu>
          <NavigationMenuList>
            {/* Purchase Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Purchase</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[250px] lg:w-[300px]">
                  <ListItem href="/order" title="Purchase Order">
                    Create and manage purchase orders.
                  </ListItem>
                  <ListItem href="/bill" title="Purchase Bill">
                    Record and track supplier bills.
                  </ListItem>
                  <ListItem href="/payment" title="Payment">
                    Process and record outgoing payments.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Sale Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Sale</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[250px] lg:w-[300px]">
                  <ListItem href="/order" title="Sale Order">
                    Manage customer sales orders.
                  </ListItem>
                  <ListItem href="/bill" title="Sale Invoice">
                    Create and send invoices to customers.
                  </ListItem>
                  <ListItem href="/payment" title="Receipt">
                    Record incoming payments and receipts.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Report Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Report</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[250px] lg:w-[300px]">
                  <ListItem href="profit-loss-statement" title="Profit & Loss">
                    View your income statement.
                  </ListItem>
                  <ListItem href="/balance-sheet" title="Balance Sheet">
                    Analyze your company's financial position.
                  </ListItem>
                  <ListItem href="/ledger" title="SLedger">
                    Track inventory levels and value.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Master Data</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[250px] lg:w-[300px]">
                  <ListItem href="/contact-master" title="Contact Master">
                    
                  </ListItem>
                  <ListItem href="/product-master" title="Product Master">
                    
                  </ListItem>
                  <ListItem href="/tax-master" title="Tax Master">
                    
                  </ListItem>
                  <ListItem href="/chart-of-accounts" title="Chart of Accounts">
                   
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <a
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Acme Inc</span>
            </a>
            <a href="#" className="hover:text-foreground">
              Purchase
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Sale
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Report
            </a>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Right side of Navbar */}
      <div className=" gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleLogout()}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export { DashboardNavbar };
