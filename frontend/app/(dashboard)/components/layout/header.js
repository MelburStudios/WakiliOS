"use client";
import {
  Badge,
  Dropdown,
  Popover,
  Select,
  Space,
  message as antMessage,
  message,
  notification as myNotification,
} from "antd";
import { FaBars } from "react-icons/fa";
import { FiLock, FiLogOut, FiUser } from "react-icons/fi";
import { BiSolidMessageDots, BiUser } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ImExit } from "react-icons/im";
import { IoMdNotifications } from "react-icons/io";
import { BsChatLeftDots } from "react-icons/bs";
import { BiSolidMessageDetail } from "react-icons/bi";
import { useUser } from "@/app/context/userContext";
import { useI18n } from "@/app/providers/i18n";
import { initializeSocket } from "@/app/helpers/socket";

const Header = () => {
  const i18n = useI18n()
  const { push } = useRouter();
  const [defaultLang, setDefaultLang] = useState(null);
  const { setUser, user } = useUser();
  const [lang, setLangId] = useState(null);





  useEffect(() => {
    let langId = localStorage?.getItem('lang');
    setLangId(langId);
    if (langId) {
      let findLang = i18n?.languages?.find(lang => lang?._id === langId);
      if (findLang) {
        setDefaultLang(findLang?.name);
      }
    } else {
      if (i18n?.languages?.length > 0) {
        const defaultLanguage = i18n?.languages?.find(lang => lang?.default);
        setDefaultLang(defaultLanguage?.name || i18n?.languages[0]?.name);
      }
    }
  }, [i18n?.languages]);

  if (!defaultLang) {
    return null;
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      message.success("Sign out successfully");
      setUser({});
      push("/");
      getUserdata();
    } catch (error) {

    }
  };

  const handleProfile = () => {
    push("/admin/profile");
  };

  const handleChangePassword = () => {
    if (user?.role === "admin") {
      push("/admin/profile/change-password");
    }
  };

  const items = [
    {
      label: "Profile",
      icon: <FiUser />,
      key: "1",
      onClick: handleProfile,
    },
    {
      label: "Change Password",
      icon: <FiLock />,
      key: "2",
      onClick: handleChangePassword,
    },
    {
      label: "Logout",
      icon: <FiLogOut />,
      key: "3",
      onClick: handleLogout,
    },
  ];

  return (
    <header className="header z-10">
      {
        <div className="flex justify-between items-center h-full p-4">
          <div className="">
            <FaBars
              className="md:hidden"
              role="button"
              onClick={() => {
                window.document
                  .querySelector(".sidebar")
                  .classList.toggle("open");
                window.document
                  .querySelector(".sidebar-overlay")
                  .classList.toggle("open");
              }}
            />
          </div>

          <div className="flex items-center gap-x-6 notification-popover">
            <div className="hidden sm:block mt-3">
              <Badge
                size="small"
                color="#E67529"
                count={0}
                onClick={() => push("/admin/message")}
              >
                <BiSolidMessageDots
                  onClick={() => push("/admin/message")}
                  size={25}
                  className={`text-textMain hover:text-primary duration-500 cursor-pointer `}
                />
              </Badge>
            </div>

          
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 hover:text-primary"
            >
              <ImExit />
              <p className="whitespace-pre">{"Live Site"}</p>
            </Link>
            <div>
              <Select
                defaultValue={defaultLang}
                style={{ width: 100, color: "black" }}
                bordered={false}
                onChange={(value) => {
                  i18n?.changeLanguage(value);
                }}
                options={i18n?.languages?.map(lang => ({ value: lang?._id, label: lang?.name }))}
                className="inline-flex items-center justify-center textSelectWhite capitalize"
              />
            </div>
            <Dropdown
              menu={{
                items,
              }}
            >
              <a className=" flex items-center">
                <Space className="">
                  {/* {user && <span className="cursor-pointer hidden sm:block">{user?.name}</span>} */}
                  <span className="cursor-pointer hidden sm:block">Admin</span>
                  <BiUser className="cursor-pointer" size={20} />
                </Space>
              </a>
            </Dropdown>
          </div>
        </div>
      }
    </header>
  );
};

export default Header;
