import "./App.css";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./Pages/Home";
import { LoginForm } from "./Pages/Login";
import { SignupForm } from "./Pages/SignUp";
import { DashboardNavbar } from "./components/ui/navbar";
import ContactForm from "./Pages/Contact-Master";
import ProductForm from "./Pages/Product-Master";
import TaxForm from "./Pages/Tax-Master";
import AccountForm from "./Pages/Chart-Of-Accounts";
import PurchaseOrderForm from "./Pages/PurchaseOrderForm";
import VendorBillForm from "./Pages/Vendor-Bill";

function App() {
  return (
    <div>
      <DashboardNavbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />

        {/* main table pages */}
        <Route path="/contact-master" element={<ContactForm />} />
        <Route path="/product-master" element={<ProductForm />} />
        <Route path="/tax-master" element={<TaxForm />} />
        <Route path="/chart-of-accounts" element={<AccountForm />} />

        {/* order pages */}
        <Route path="/purchase-order" element={<PurchaseOrderForm />} />
        <Route path="/vendor-bill" element={<VendorBillForm />} />

        {/* login/signup pages */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
      </Routes>
    </div>
  );
}

export default App;
