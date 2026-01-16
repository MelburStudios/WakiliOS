"use client";
import { useEffect, useState } from "react";
import { Drawer, message, Space } from "antd";
import { IoMdMenu } from "react-icons/io";
import { MdOutlineDashboard } from "react-icons/md";
import { IoInformationCircleOutline, IoSettingsOutline } from "react-icons/io5";
import { HiOutlineLogout } from "react-icons/hi";
import { GiClawHammer } from "react-icons/gi";
import { TbMessage } from "react-icons/tb";
import { LuCalendarClock, LuCalendarDays } from "react-icons/lu";
import { GoLaw } from "react-icons/go";
import { RiUserSearchLine } from "react-icons/ri";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useModal } from "@/app/context/modalContext";
import UserDashboardSkeleton from "@/app/components/skeleton/userDashboardSkeleton";
import AppointmentRequest from "./dashboard/modal/appointmentRequest";
import NewCaseRequest from "./dashboard/modal/newCaseRequest";
import { useUser } from "@/app/context/userContext";

import { useI18n } from "@/app/providers/i18n";
import { initializeSocket, subscribeToAppointments } from "@/app/helpers/socket";
import { getProfile } from "@/app/helpers/backend";
import { useFetch } from "@/app/helpers/hooks";

const AttorneyDashboardLayout = ({ children }) => {
  const {user, setUser} = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);
  const i18n = useI18n();
  useEffect(() => {
    getProfile().then(({ error, data, msg }) => {
      if (error) {
        message.error("Please login as attorney");
        router.push("/");
      } else {
        if (data?.role === "attorney") {
          getUserdata();
        } else {
          router.push("/");
          message.error("Please login as attorney");
          getUserdata();
          setLoginModalOpen(true);
        }
      }
    });
  }, []);
  const {
    isCaseRequest,
    setIsCaseRequest,
    isAppointmentRequest,
    setIsAppointmentRequest,
  } = useModal();
  const router = useRouter();
  const [userdata,getUserdata,{loading:userLoading}]=useFetch(getProfile);

  const menuItems = [
    {
      id: 1,
      name: "Dashboard",
      href: "/attorney/dashboard",
      icon: <MdOutlineDashboard />,
    },
    {
      id: 2,
      name: "My Cases",
      href: "/attorney/cases",
      icon: <GiClawHammer />,
    },
     {
      id: 4,
      name: "Booking",
      href: "/attorney/booking",
      icon: <LuCalendarDays />,
    },
    {
      id: 5,
      name: "Availability",
      href: "/attorney/availablity",
      icon: <LuCalendarClock />,
    },
    {
      id: 6,
      name: "Client's",
      href: "/attorney/client",
      icon: <RiUserSearchLine />,
    },
    { id: 7, 
      name: "Message", 
      href: "/attorney/message", 
      icon: <TbMessage /> },

    {
      id: 8,
      name: "Settings",
      href: "/attorney/setting",
      icon: <IoSettingsOutline />,
    },
  ];



  return (userdata?.role !== "attorney") ? (
    <UserDashboardSkeleton open={open} showDrawer={showDrawer} onClose={onClose} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
  ) : (
    <section className="bg-white">
      <div className="custom-container lg:pt-[150px] pt-[150px] lg:pb-[150px] pb-[100px]">
        {/* Small Screen Sidebar */}
        <div className="flex items-end justify-between mb-[56px]">
          <div className="">
            <h2 className="font-sans font-medium text-[24px] leading-[28.15px] pb-[24px]">
              {i18n?.t('Good Morning')},
              <span className="sm:text-[38px] text-[28px] ms-1 leading-[44.57px] break-all">
                {user?.name}
              </span>
            </h2>
            <p className="text-base font-normal font-sans text-textColor md:w-[353px] w-[250px]">
              {i18n?.t("Here's a quick overview of your performance. Let's make today another successful day!")}
            </p>
          </div>
          <Space className="lg:hidden block">
            <IoMdMenu className="text-[40px]" onClick={showDrawer} />
          </Space>

          <Drawer
            placement={"right"}
            closable={false}
            onClose={onClose}
            open={open}
          >
            <SidebarContent menuItems={menuItems}/>
          </Drawer>
        </div>
        <div className="w-full flex lg:flex-row flex-col gap-6">
          {/* Large Screen Sidebar */}
          <div className="hidden lg:block lg:w-1/4 w-full border  rounded-[20px] pb-[113px] shadow-md overflow-hidden">
            <SidebarContent
              menuItems={menuItems}
              setIsCaseRequest={setIsCaseRequest}
              setIsAppointmentRequest={setIsAppointmentRequest}
            />
          </div>

          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
              onClick={toggleSidebar}
            ></div>
          )}

          <div className="lg:w-3/4 w-full shadow-md rounded-[20px] border  ">
            {children}
          </div>
        </div>
      </div>
      {isCaseRequest && <NewCaseRequest />}
      {isAppointmentRequest && <AppointmentRequest />}
    </section>
  );
};

const SidebarContent = ({
  menuItems,
  setIsCaseRequest,
  setIsAppointmentRequest,


}) => {
  const pathname = usePathname();
  const { user, getUserdata, setUser, userLoading } = useUser();
  const router=useRouter();
  const i18n = useI18n();
  return (
    <div className="">
      <div className="bg-[#EDEDED]">
        <div className="flex justify-start ps-4 items-center gap-[10px] py-[34px]">
          <div className={`${user?.image && "border"}rounded-full   border-black`}>
            <Image
              width={48}
              height={48}
              className="rounded-full w-[48px] h-[48px] object-cover"
              src={user?.image || '/images/defaultimg.jpg'}
              alt="profile"
            />
          </div>
          <div>
            <h3 className="font-medium mb-[2px]">{user?.name}</h3>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>
      <div className="pt-[40px]  mx-auto px-4 w-[242px]">
        <nav className="space-y-[27px]">
          {menuItems?.map((item, index) => (
            <Link
              key={index}
              href={item?.href}
              className={`flex items-center !w-fit gap-[15px] ${
                pathname === item.href ? "text-[#B68C5A]" : "text-[#242628]"
              }`}
            >
              <span className="text-[24px]">{item.icon}</span>
              <span className="sidebar-title">{i18n?.t(item?.name)}</span>
            </Link>
          ))}
          <div className="pt-[50px] space-y-[27px]">
            <Link
              href="/attorney/help"
            className={`flex items-center gap-[15px] 
             ${
              pathname === "/attorney/help"
                ? "text-[#B68C5A]"
                : "text-[#242628]"
            }
            `}
          >
            <div className="flex items-center gap-[15px]">
              <span
                className="text-[24px]"
                onClick={() => {
                  setIsAppointmentRequest(true);
                }}
              >
                <IoInformationCircleOutline />
              </span>
              <span className="sidebar-title">{i18n?.t("Help & Info")}</span>
            </div>
            </Link>
            <a
              href="#"
              className="flex gap-[15px] items-center"
              onClick={() => {
                localStorage.removeItem("token");
                message.success("Sign out successfully");
                router.push("/");
                setUser({});
                getUserdata();
              }}
            >
              <HiOutlineLogout className="h-6 w-6 hover:text-[#B68C5A] text-[#242628]" />
              <span className="sidebar-title">{i18n?.t("Logout")}</span>
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AttorneyDashboardLayout;
