import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Page and Component Imports
import RoleBasedRoutes from "./components/RoleBasedRoutes";
import Dashboard from "./Pages/Home";
import { LoginForm } from "./Pages/Login";
import { SignupForm } from "./Pages/SignUp";
import CreateUserForm from "./Pages/CreateUser";
import { DashboardNavbar } from "./components/ui/navbar";
import ContactForm from "./Pages/ContactMaster";
import ProductForm from "./Pages/Product-Master";
import TaxForm from "./Pages/TaxMaster";
import AccountForm from "./Pages/ChartOfAccounts";
import PurchaseOrderForm from "./Pages/Order";
import VendorBillForm from "./Pages/Bill";
import BillPaymentForm from "./Pages/Payment";
import BillLedger from "./Pages/Ledger";
import ProfitLossStatement from "./Pages/PLStatement";
import BalanceSheet from "./Pages/Balance-sheet";
import { MasterDataListPage } from "./Pages/MasterDataListPage";
import CustomerInvoicePortal from "./Pages/CustomerInvoiceViewPortal";
import PaymentPage from "./Pages/PaymentPage";
import PaymentSuccessPage from "./Pages/PaymentSuccessPage";

function App() {
  return (
    <div>
      <Toaster richColors position="top-right" />

      <Routes>
        {/* --- Public Routes (Accessible to everyone) --- */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/create" element={<CreateUserForm />} />
        <Route element={<RoleBasedRoutes allowedRoles={["Customer"]} />}>
          <Route
            path="/customer-invoice-portal"
            element={<CustomerInvoicePortal />}
          />
          <Route path="/payment/:id" element={<PaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
        </Route>

        {/* --- Routes for Admin & Invoicing (Create and View) --- */}
        <Route
          element={<RoleBasedRoutes allowedRoles={["Admin", "Invoicing"]} />}
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/master-data" element={<MasterDataListPage />} />
          <Route path="/contact-master/create" element={<ContactForm />} />
          <Route path="/product-master/create" element={<ProductForm />} />
          <Route path="/tax-master/create" element={<TaxForm />} />
          <Route path="/chart-of-accounts/create" element={<AccountForm />} />
          <Route path="/order" element={<PurchaseOrderForm />} />
          <Route path="/bill" element={<VendorBillForm />} />
          <Route path="/payment" element={<BillPaymentForm />} />
          <Route path="/ledger" element={<BillLedger />} />
          <Route
            path="/profit-loss-statement"
            element={<ProfitLossStatement />}
          />
          <Route path="/balance-sheet" element={<BalanceSheet />} />
        </Route>

        {/* --- Routes for Admin ONLY (Edit) --- */}
        <Route element={<RoleBasedRoutes allowedRoles={["Admin"]} />}>
          <Route path="/contact-master/:id/edit" element={<ContactForm />} />
          <Route path="/product-master/:id/edit" element={<ProductForm />} />
          <Route path="/tax-master/:id/edit" element={<TaxForm />} />
        </Route>

        {/* Optional: Add a "Not Found" route */}
        <Route path="*" element={<h1>404: Page Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;
