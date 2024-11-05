import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Your shared sidebar component
import TopBar from './TopBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const DashboardLayout = () => {
  return (
    <div className="flex">
      {/* <TopBar /> */}
      <Sidebar  />
      <ToastContainer />
     
      <div className="flex-grow ">
    
        <Outlet />
        {/* <TopBar/> */}
      </div>
    </div>
  );
};

export default DashboardLayout;