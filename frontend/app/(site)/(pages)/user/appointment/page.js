"use client";
import { IoEyeOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import UserDashboardTable from "@/app/components/common/table/userDashboardTable";
import PageTitle from "@/app/components/common/title/pageTitle";
import { useI18n } from "@/app/providers/i18n";
import {
  fetchUserAttorney,
  getAppointmentHistory,
} from "@/app/helpers/backend";
import { useFetch } from "@/app/helpers/hooks";
import dayjs from "dayjs";

const UserAppointment = () => {
  const i18n = useI18n();
  const { push } = useRouter();
  const [data, getData, { loading }] = useFetch(getAppointmentHistory);
  const [attorney, getAttorney] = useFetch(fetchUserAttorney, {});
  
  
  const columns = [
    { text: "Case Type", dataField: "case_type" },
    {
      text: "Attorney",
      dataField: "attorney",
      formatter: (_, d) => {
        return (
       
            <span>{d?.attorney?.name}</span>
         
        );
      },
    },
    {
      text: "Case Status",
      dataField: "status",
      formatter: (_, d) => {
        return (
          <div className="flex items-center gap-2 text-sm">
            {d?.status === "pending" && (
              <p className="p-2 capitalize rounded-[50px] text-white bg-[#EAB308] flex items-center justify-center">
                {d?.status}
              </p>
            )}
            {d?.status === "confirmed" && (
              <p className="p-2 capitalize rounded-[50px] text-white bg-[#6C757D] flex items-center justify-center">
                {d?.status}
              </p>
            )}
            {d?.status === "completed" && (
              <p className="p-2 capitalize rounded-[50px] text-white bg-[#22C55E] flex items-center justify-center">
                {d?.status}
              </p>
            )}
            {d?.status === "rejected" && (
              <p className="p-2 capitalize rounded-[50px] text-white bg-[#F05454] flex items-center justify-center">
                {d?.status}
              </p>
            )}
          </div>
        );
      },
    },
    {
      text: "Appointment Date",
      dataField: "select_date",
      formatter: (_, d) => {
        return (
          <div className="flex items-center gap-2">
            <p>{dayjs.utc(d?.select_date).format("DD MMMM YYYY")}</p>
          </div>
        );
      },
    },
    {
      text: "Action",
      dataField: "action",
      formatter: (_, d) => {
        return (
          <div
            className="grid cursor-pointer place-content-center w-[40px] h-[40px] hover:bg-primary hover:text-white text-[24px] rounded-[10px] border hover:border-primary border-[#E0E0E0]"
            onClick={() => {
              push(`/user/appointment/${d?.id || d?._id}`);
            }}
          >
            <IoEyeOutline />
          </div>
        );
      },
    },
  ];
  return (
    <div>
      <div className="flex sm:flex-row flex-col mx-5 my-7 justify-between items-center sm:gap-0 gap-6">
        <h1 className="dashboard-title">{i18n?.t("Appointment")}</h1>
      </div>
      <hr />
      <div className=" px-[24px]">
        <UserDashboardTable
          data={data}
          onReload={getData}
          loading={loading}
          columns={columns}
          pagination
        />{" "}
      </div>
    </div>
  );
};

export default UserAppointment;
