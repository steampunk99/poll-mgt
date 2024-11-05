import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Your shared sidebar component
import TopBar from './TopBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import  Breadcrumbs  from "../../components/Breadcrumbs";

const DashboardLayout = () => {
  return (
    <div className="flex">
     
      <Sidebar  />
      
      
     
      <div className="flex-grow p-8">
      <Breadcrumbs className="" />
        <Outlet />
        {/* <TopBar/> */}
      </div>
    </div>
  );
};

export default DashboardLayout;