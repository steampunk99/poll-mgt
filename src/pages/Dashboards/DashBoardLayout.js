import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Your shared sidebar component
import TopBar from './TopBar';

const DashboardLayout = () => {
  return (
    <div className="flex">
      {/* <TopBar /> */}
      <Sidebar  />
     
      <div className="flex-grow ">
    
        <Outlet />
        {/* <TopBar/> */}
      </div>
    </div>
  );
};

export default DashboardLayout;