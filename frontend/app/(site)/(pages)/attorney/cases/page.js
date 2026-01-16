"use client";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegFilePdf } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import SearchBar from "@/app/components/common/searchBar";
import UserDashboardTable from "@/app/components/common/table/userDashboardTable";
import { useFetch } from "@/app/helpers/hooks";
import { getAttorneyCases } from "@/app/helpers/backend";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useI18n } from "@/app/providers/i18n";

const MyCase = () => {
  const [data, getData, { loading }] = useFetch(getAttorneyCases, {});
  const handleDownloadPDF = (data) => {
    const link = document.createElement("a");
    link.href = data;
    link.download = "assignment.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const i18n = useI18n();
  useEffect(() => {
    getData({ search: searchQuery });
  }, [searchQuery]);
  const columns = [
    { text: "Case Type", dataField: "case_type" },
    {
      text: "Client Name", dataField: "client_name", formatter: ((_, d) => {
        return (
          <span>{d?.user?.name}</span>
        )
      })
    },
    {
      text: "Essential File",
      dataField: "evidence",
      formatter: (_, d) => {
        return (
          <div
            className="flex gap-2 text-xs items-center cursor-pointer place-content-center w-[118px] h-[34px] bg-[#EDEDED] text-textColor text-[24px] rounded-[10px] border "
            onClick={() => {
              handleDownloadPDF(d?.evidence[0]);
            }}
          >
            <FaRegFilePdf />
            <span className="text-xs font-sans font-semibold">{i18n.t("Evidence")}</span>
          </div>
        );
      },
    },
    {
      text: "Appointment Date", dataField: "hearing_date", formatter: ((_, d) => {
        return (
          <span>{dayjs(d?.select_date).format('DD MMMM YYYY')}</span>
        )
      })
    },
    {
      text: "Action",
      dataField: "action",
      formatter: (_, d) => {
        return (
          <div
            className="grid cursor-pointer place-content-center w-[40px] h-[40px] hover:bg-primary hover:text-white text-[24px] rounded-[10px] border hover:border-primary border-[#E0E0E0]"
            onClick={() => {
              push(`/attorney/cases/${d?._id || d?.id}`);
            }}
          >
            <IoEyeOutline />
          </div>
        );
      },
    },
  ];
  const { push } = useRouter();
  return (
    <div>
     <div className="flex sm:flex-row flex-col justify-between mx-5  my-7 items-center sm:gap-0 gap-6 lg:h-[56px] h-auto">
        <h1 className="dashboard-title">{i18n?.t("My Cases")}</h1>
        <SearchBar
          placeholder={i18n?.t("Search Cases...")}
          wrapperClassName={"sm:w-[293px] w-full"}
          className={""}
          style={{ marginBottom: "-1px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
        />
      </div>
      <hr />
      <div className=" px-[24px]">
        <UserDashboardTable data={data} onReload={getData} columns={columns} pagination loading={loading} />
      </div>
    </div>
  );
};

export default MyCase;
