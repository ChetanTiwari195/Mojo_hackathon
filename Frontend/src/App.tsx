// file: App.js

import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Page and Component Imports
import ProtectedRoutes from "./components/ProtectedRoutes"; // ✅ Import the new component
import AdminRoutes from "./components/AdminRoutes";
import Dashboard from "./Pages/Home";
import { LoginForm } from "./Pages/Login";
import { SignupForm } from "./Pages/SignUp";
import CreateUserForm from "./Pages/CreateUser";
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
        {/* --- Public Routes --- */}
        {/* These routes are accessible to everyone. */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route
          path="/customer-invoice-portal"
          element={<CustomerInvoicePortal />}
        />
        <Route path="/payment/:id" element={<PaymentPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />

        {/* --- Protected Routes --- */}
        {/* All routes inside here will require a user to be logged in. */}
        {/* They will also share the DashboardNavbar layout. */}
        <Route element={<ProtectedRoutes />}>
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

          {/* --- Nested Admin-Only Routes --- */}
          {/* These require the user to be a logged-in ADMIN. */}
          <Route element={<AdminRoutes />}>
            <Route path="/create" element={<CreateUserForm />} />
            <Route path="/contact-master/:id/edit" element={<ContactForm />} />
            <Route path="/product-master/:id/edit" element={<ProductForm />} />
            <Route path="/tax-master/:id/edit" element={<TaxForm />} />
          </Route>
        </Route>

        {/* Optional: Add a "Not Found" route */}
        <Route path="*" element={<h1>404: Page Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;
