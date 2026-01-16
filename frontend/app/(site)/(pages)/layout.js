'use client'
import axios from "axios";
import { useEffect, useState } from "react";
import Footer from "@/app/components/layout/footer";
import Navbar from "@/app/components/layout/header";
import Topbar from "@/app/components/layout/topbar";
import { useRouter } from "next/navigation";
import React from "react";

const layout = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkEnvFile = async () => {
      const { data } = await axios.get(process.env.backend_url + "api/settings/check-env");
      if (data?.data?.status === true && data?.data?.env === false) {
        router.push('/setting')
      }
      setLoading(false);
    }
    checkEnvFile()
  }, [])
  if(loading){
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  return (
    <div>
      <Topbar />
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default layout;
