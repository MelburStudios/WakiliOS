"use client";
import { useEffect, useState } from "react";
import { Drawer, message, Space } from "antd";
import { IoMdMenu } from "react-icons/io";
import { MdOutlineDashboard } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { HiOutlineLogout } from "react-icons/hi";
import { FaClockRotateLeft } from "react-icons/fa6";
import { GiClawHammer } from "react-icons/gi";
import { TbMessage } from "react-icons/tb";
import { LuCalendarClock } from "react-icons/lu";
import { VscFiles } from "react-icons/vsc";
import UserDashboardSkeleton from "@/app/components/skeleton/userDashboardSkeleton";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Appointment from "./attorney/appointment";
import { useUser } from "@/app/context/userContext";
import { getProfile } from "@/app/helpers/backend";
import { useModal } from "@/app/context/modalContext";
import { useI18n } from "@/app/providers/i18n";

const UserDashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, getUserdata, setUser, userLoading } = useUser();
  const { setLoginModalOpen } = useModal();
  const i18n = useI18n();
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  useEffect(() => {
    getProfile().then(({ error, data, msg }) => {
      if (error) {
        message.error("Please login as user");
        router.push("/");
      } else {
        if (data?.role === "user") {
          getUserdata();
        } else {
          router.push("/");
          message.error("Please login as user");
          getUserdata();
          setLoginModalOpen(true);
        }
      }
    });
  }, []);
  

  const menuItems = [
    { id: 1, name: "Dashboard", href: "/user/dashboard", icon: <MdOutlineDashboard /> },
    { id: 2, name: "Attorney", href: "/user/attorney", icon: <GiClawHammer /> },
    { id: 4, name: "Appointments", href: "/user/appointment", icon: <LuCalendarClock /> },
    { id: 5, name: "Files", href: "/user/files", icon: <VscFiles /> },
    { id: 6, name: "Message", href: "/user/message", icon: <TbMessage /> },
    { id: 7, name: "Settings", href: "/user/setting", icon: <IoSettingsOutline /> },
  ];

  return (
    <>
      {
        !user ? (
          <UserDashboardSkeleton />
        ) :
          <section className="bg-white">
            <div className="custom-container lg:pt-[200px] pt-[150px] lg:pb-[150px] pb-[100px]">
              <div className="w-full flex lg:flex-row flex-col gap-6">
                <div className="block lg:hidden">
                  <Space>
                    <IoMdMenu className="text-[40px]" onClick={showDrawer} />
                  </Space>
                  <Drawer placement="left" closable={false} onClose={onClose} open={open}>
                    <SidebarContent menuItems={menuItems} />
                  </Drawer>
                </div>

                <div className="hidden lg:block lg:w-1/4 w-full border rounded-[20px] pb-[113px] shadow-md overflow-hidden">
                  <SidebarContent menuItems={menuItems} />
                </div>

                {isSidebarOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40" onClick={toggleSidebar}></div>
                )}

                <div className="lg:w-3/4 w-full shadow-md rounded-[20px] border overflow-hidden">
                  {children}
                </div>
              </div>
            </div>
            <Appointment />
          </section>
     } 
    </>
  );

};

const SidebarContent = ({ menuItems }) => {
  const pathname = usePathname();
  const { user, setUser, getUserdata } = useUser();
  const i18n = useI18n();
  const router = useRouter();

  return (
    <div>
      <div className="bg-[#EDEDED]">
        <div className="flex justify-start ps-4 items-center gap-[10px] py-[34px]">
          <div className="rounded-full p-[3px] border border-black">
            <Image
              width={48}
              height={48}
              className="rounded-full w-[48px] h-[48px] object-cover"
              src={user?.image || "/images/defaultimg.jpg"}
              alt="profile"
            />
          </div>
          <div>
            <h3 className="font-medium mb-[2px]">{user?.name}</h3>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="pt-[40px] mx-auto px-4 w-[242px]">
        <nav className="space-y-[27px] w-fit">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center !w-fit gap-[15px] ${pathname.startsWith(item?.href) ? "text-primary" : "!text-[#242628]"
                }`}
            >
              <span className="text-[24px] ">{item?.icon}</span>
              <span className="sidebar-title ">{i18n?.t(item?.name)}</span>
            </Link>
          ))}

          <div className="pt-[50px] space-y-[27px]">
            <Link
              href="/user/help"
              className={`flex items-center gap-[15px] ${pathname === "/user/help" ? "text-[#B68C5A]" : "text-[#242628]"
                }`}
            >
              <span className="text-[24px]">
                <IoIosInformationCircleOutline />
              </span>
              <span className="sidebar-title">{i18n?.t("Help & Info")}</span>
            </Link>
            <a
              className="flex items-center gap-[15px] cursor-pointer"
              onClick={() => {
                localStorage.removeItem("token");
                message.success("Sign out successfully");
                setUser({});
                router.push("/");
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

export default UserDashboardLayout;
