import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
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

function App() {
  return (
    <div>
      <Toaster richColors position="top-right" />
      <DashboardNavbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />

        {/* main table pages */}
        <Route path="/contact-master" element={<ContactForm />} />
        <Route path="/product-master" element={<ProductForm />} />
        <Route path="/tax-master" element={<TaxForm />} />
        <Route path="/chart-of-accounts" element={<AccountForm />} />

        {/* order pages */}
        <Route path="/order" element={<PurchaseOrderForm />} />
        <Route path="/bill" element={<VendorBillForm />} />
        <Route path="/payment" element={<BillPaymentForm />} />

        {/* ledgers */}
        <Route path="/ledger" element={<BillLedger />} />
        <Route
          path="/profit-loss-statement"
          element={<ProfitLossStatement />}
        />
        <Route path="/balance-sheet" element={<BalanceSheet />} />

        {/* login/signup pages */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/create" element={<CreateUserForm />} />
      </Routes>
    </div>
  );
}

export default App;
