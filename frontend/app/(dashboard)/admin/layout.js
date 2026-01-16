"use client";
import { BiCategory, BiCreditCard } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { message, Skeleton, Spin } from "antd";
import { LuContact, LuGalleryHorizontal } from "react-icons/lu";
import { FaRegNewspaper, FaServicestack, FaStore, FaUsers } from "react-icons/fa";
import { GrSchedulePlay } from "react-icons/gr";
import { LiaShippingFastSolid, LiaStoreAltSolid } from "react-icons/lia";
import { CiShoppingTag } from "react-icons/ci";
import {
  PiContactlessPaymentFill,
  PiNewspaperClippingBold,
  PiQuotesThin,
  PiReadCvLogo,
} from "react-icons/pi";
import {
  FaBarcode,
  FaCopy,
  FaFeatherPointed,
  FaHouse,
  FaLanguage,
  FaQuestion,
  FaWrench,
} from "react-icons/fa6";
import {
  MdCategory,
  MdCurrencyPound,
  MdEmail,
  MdEmojiEvents,
  MdGroups2,
  MdHistory,
  MdOutlineInsertPageBreak,
  MdOutlinePriceCheck,
  MdOutlineSpaceDashboard,
} from "react-icons/md";
import { GiTakeMyMoney } from "react-icons/gi";

import { IoWalletOutline } from "react-icons/io5";
import { BsFillAwardFill, BsShop } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sideBar";
import { useUser } from "@/app/context/userContext";
import { getProfile, updateProfile } from "@/app/helpers/backend";
import { FiMessageCircle, FiMessageSquare } from "react-icons/fi";


const Layout = ({ children }) => {
  const router = useRouter();
  const { user, getUserdata, setUser, otpPayload, setOtpPayload,settings } = useUser();
  const push = router.push;
  const { pathname } = router;
  const menu = getMenu(user, push, pathname);

  useEffect(() => {
    getProfile().then(({ error, data, msg }) => {
      if (error) {
        message.error('Please login as admin');
        router.push("/");
      }
      else {
        if (data?.role === "admin") {
          getUserdata();
          setUser(data?.user);
        } else if ((data?.role !== "admin")) {
          getUserdata();
          message.error("Please login as admin");
          router.push("/");
        }
      }

    });
  }, []);


  if (!user || user?.role !== "admin") {

    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <div className="w-[250px] p-4">
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
          <div className="flex-1">
            <div className="p-4 py-12">
              <Skeleton active title={false} paragraph={{ rows: 1 }} />
            </div>
            <div className="p-4">
              <Skeleton active paragraph={{ rows: 10 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {!!(user?.role === "admin") && (
        <>
     
          <Sidebar title={settings?.title} menu={menu} />
          <Header title={settings?.title} />
          <div className="content">
            <div className="p-4">{children}</div>
          </div>
 
        </>
      )}
    </div>
  );
};

export default Layout;

const menu = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <MdOutlineSpaceDashboard />,
    permissions: ["admin", "dashboard"],
  },
  {
    label: "Case Type",
    href: "/admin/caseType",
    icon: <BiCategory />,
    permissions: ["admin", "caseType_view"],
  },
  {
    label: "Attorney",
    href: "/admin/attorney",
    icon: <BsFillAwardFill />,
    permissions: ["admin", "trainers_view"],
  },
  {
    label: "Case Study",
    href: "/admin/case-study",
    icon: <PiReadCvLogo />,
    permissions: ["admin", "case_study_view"],
  },

  {
    menu: "payment",
    permissions: ["admin", "payment"],
  },
  {
    label: "Payment Method",
    href: "/admin/payment-method",
    icon: <PiContactlessPaymentFill />,
    permissions: ["admin", "payment_method_view"],
  },

  {
    label: "Payment list",
    href: "/admin/payment-list",
    icon: <GiTakeMyMoney />,
    permissions: ["admin", "payment_list_view"],
  },
  {
    menu: "Blog",
    permissions: ["admin", "blog"],
  },
  {
    label: "Category",
    href: "/admin/blog/category",
    icon: <BiCategory />,
    permissions: ["admin", "blog_category_view"],
  },
  {
    label: "Tags",
    href: "/admin/blog/tags",
    icon: <CiShoppingTag />,
    permissions: ["admin", "blog_tags_view"],
  },
  {
    label: "Blogs",
    href: "/admin/blog",
    icon: <PiReadCvLogo />,
    permissions: ["admin", "blogs_view"],
  },

  {
    menu: "other",
    permissions: ["admin", "other"],
  },

  {
    label: "Service",
    href: "/admin/service",
    icon: <FaServicestack />,
    permissions: ["admin", "service"],
  },
  {
    label: "Newsletter",
    href: "/admin/newsletter",
    icon: <FaRegNewspaper />,
    permissions: ["admin", "newsletter"],
  },
  {
    label: "Testimonial",
    href: "/admin/testimonial",
    icon: <FiMessageSquare />,
    permissions: ["admin", "testimonial"],
  },
  {
    label: "Contact",
    href: "/admin/contacts",
    icon: <LuContact />,
    permissions: ["admin", "contact_view"],
  },
  {
    label: "Message",
    href: "/admin/message",
    icon: <FiMessageCircle />,
    permissions: ["admin", "message"],
  },
  {
    menu: "Settings",
    permissions: ["admin", "settings"],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <FaWrench />,
    permissions: ["admin", "site_settings_view"],
  },
  {
    label: "Languages",
    href: "/admin/languages",
    icon: <FaLanguage />,
    permissions: ["admin", "language_view"],
  },

  {
    label: "Email Settings",
    href: "/admin/email-setting",
    icon: <MdEmail />,
    permissions: ["admin", "email_settings_view"],
  },

  {
    label: "Faq",
    href: "/admin/faq",
    icon: <FaQuestion />,
    permissions: ["admin", "faq_view"],
  },
  {
    label: "Page Settings",
    href: "/admin/page-settings",
    icon: <MdOutlineInsertPageBreak />,
    permissions: ["admin", "page_settings_view"],
  },
];

const getMenu = (user, push, pathname) => {
  const hasPermission = menu => {
    if (menu.permission && havePermission(menu.permission, user?.roles)) {
      return true
    }
    if (menu.permissions) {
      for (let permission of menu.permissions) {
        if (havePermission(permission, user?.roles)) {
          return true
        }
      }
    }
    if (menu.permissions) {
      for (let permission of menu.permissions) {
        if (roleWisePermission(permission, [user?.role])) {
          return true
        }
      }
    }
    if (menu.permission) {
      if (roleWisePermission('admin', [user?.role])) {
        return true
      }
    }
    return false
  }
  return menu?.map(d => ({ ...d, href: d.href?.replace('[_id]', user?._id) })).filter(menu => {
    if (menu?.permission === 'any') {
      return true
    } else if (menu.permission || menu.permissions) {
      return hasPermission(menu)
    } else if (Array.isArray(menu.child)) {
      menu.child = menu.child.filter(child => {
        // return hasPermission(child)
      })
      return menu.child.length > 0
    }
    return false
  })
}

export const havePermission = (permission, roles) => {
  for (let role of roles || []) {
    if (role?.permissions?.includes(permission)) {
      return true;
    }
  }
  return false;
};

export const roleWisePermission = (permission, roles) => {
  if (roles?.includes(permission)) {
    return true
  }
  return false
}
