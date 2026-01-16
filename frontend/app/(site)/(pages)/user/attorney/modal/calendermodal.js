"use client";
import React, { useState, useEffect, useRef } from "react";
import { Calendar, Modal } from "antd";
import { IoClose } from "react-icons/io5";
import { TfiAngleRight, TfiAngleLeft } from "react-icons/tfi";
import dayjs from "dayjs";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useModal } from "@/app/context/modalContext";
import Button from "@/app/components/common/button";
import { BiMessageDots } from "react-icons/bi";
import { useI18n } from "@/app/providers/i18n";
import Messsage from "./message";
import { useFetch } from "@/app/helpers/hooks";
import { userbookingSlots } from "@/app/helpers/backend";
import Image from "next/image";

const CalendarModal = ({
  setselectDate,
  selectSlot,
  setSelectSlot,
  setIsCaseDetailsOpen,
  selectDate,
  data,
  availability,
}) => {
  const [bookingdata] = useFetch(userbookingSlots);
  const { isAppointmentOpen, setIsAppointmentOpen } = useModal();
  const [viewDate, setViewDate] = useState(dayjs().format("dddd, D MMMM YYYY"));
  const [pageCount, setPageCount] = useState(1);
  const [isSlotDisplayed, setIsSlotDisplayed] = useState(false);
  const [open, setOpen] = useState(false);
  const [senderId, setSenderId] = useState("");
  const datewiseSlot = availability?.find(
    (i) => i?.date === selectDate
  )?.timeSlots;
function formatDate(isoDate) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Example usage



  const bookingSlots = bookingdata?.find(
    (i) => formatDate(i?.select_date) === selectDate
  )?.slot_time;
  const isMonthChangingRef = useRef(false);
  const i18n = useI18n();
  const handleMonthChange = (newValue, onChange) => {
    isMonthChangingRef.current = true;
    onChange(newValue);
    setTimeout(() => {
      isMonthChangingRef.current = false;
    }, 200);
  };

  useEffect(() => {
    if (selectDate) {
      const filterDate = availability?.find((i, index) => {
        if (i === selectDate) {
          return i;
        }
      });
      if (filterDate) {
        setIsSlotDisplayed(true);
      } else {
        setIsSlotDisplayed(false);
      }
    }
  }, [selectDate, availability]);

  const slotsPerPage = 9;

  const paginatedSlots = datewiseSlot?.slice(
    (pageCount - 1) * slotsPerPage,
    pageCount * slotsPerPage
  );

  const handlePageChange = (direction) => {
    const totalPages = Math.ceil(datewiseSlot?.length / slotsPerPage);

    if (direction === "prev" && pageCount > 1) {
      setPageCount(pageCount - 1);
    } else if (direction === "next" && pageCount < totalPages) {
      setPageCount(pageCount + 1);
    }
  };
  const isPastTime = (slotTime) => {
    const now = dayjs();
    const selected = dayjs(selectDate, "DD/MM/YYYY");
    if (selected.isBefore(now, "day")) {
      return true;
    } else if (selected.isSame(now, "day")) {
      const slot24Hour = dayjs(slotTime, ["h.mmA"]).format("HH:mm");
      const current24Hour = now.format("HH:mm");
      return slot24Hour < current24Hour;
    }
    return false;
  };

  const disabledDate = (current) => {
    if (dayjs(current).isBefore(dayjs(), "day")) {
      return true;
    }
  };

  return (
    <Modal
      className="!bg-transparent"
      footer={null}
      closeIcon={false}
      open={isAppointmentOpen}
      onCancel={() => {
        setIsAppointmentOpen(false);
        setSelectSlot("");
        setselectDate("");
      }}
      style={{ position: "relative", zIndex: "200" }}
      width="800px"
    >
      <div className="w-full mx-auto bg-white rounded-[20px] p-[10px] relative client">
        <button
          className="w-[32px] h-[32px] rounded-full bg-[#EDEDED] absolute sm:right-0 right-[2px] top-[2px] sm:top-0 inline-flex justify-center items-center"
          onClick={() => {
            setIsAppointmentOpen(false);
            setSelectSlot("");
            setselectDate("");
          }}
        >
          <IoClose
            size={20}
            className="text-[#242628] text-[12px] cursor-pointer"
          />
        </button>
        <div className="flex md:flex-row flex-col gap-x-0 gap-y-10">
          <div className="md:w-1/2 w-full">
            <h3 className="font-medium leading-[23.46px] text-[20px] pb-[24px] text-[#191930] font-ebgramond">
              {i18n?.t("Book Appointment")}
            </h3>
            <div className="pe-[40px]">
              <div className="flex items-center gap-3 mb-8 border-b pb-[25px]">
                <Image
                  width={100}
                  height={100}
                  className="h-16 w-16 rounded-full"
                  src={data?.image || "/images/defaultimg.jpg"}
                  alt={"attorney"}
                />
                <div>
                  <p className="font-medium text-lg text-[#242628]">
                    {data?.name}
                  </p>
                  <p className="font-medium text-[#3A3D3F]">
                    {data?.designation}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 !text-base">
                <p className="max-w-[356px]">
                  <span className="font-medium">{i18n?.t("Biography")}:</span>{" "}
                  <span className="text-[#3A3D3F]">{data?.bio}</span>
                </p>
                <p className=" text-[#3A3D3F]">
                  <span className="font-medium">
                    {i18n?.t("Certifications & Qualification")}:
                  </span>{" "}
                  <span
                    className="text-[#3A3D3F]"
                    dangerouslySetInnerHTML={{
                      __html: data?.certifications,
                    }}
                  ></span>
                </p>
                <p>
                  <span className="font-medium">{i18n?.t("Experience")}:</span>{" "}
                  <span className="text-[#3A3D3F]">
                    {data?.experience} {i18n?.t("years")}
                  </span>
                </p>
              </div>
              <div
                onClick={() => {
                  setSenderId(data?._id);
                  setOpen(true);
                }}
                className="flex items-center space-x-1 mt-4 cursor-pointer hover:underline duration-500  lg:mt-[130px]"
              >
                <BiMessageDots />
                <span className="text-sm text-textBody whitespace-pre">
                  {i18n.t("Chat Now")}
                </span>
              </div>
            </div>
          </div>
          <div className="h-[455px] w-[1px] bg-[#D9D9D9] xl:block hidden my-auto" />
          <div className="md:w-1/2 w-full xl:ps-[40px]">
            <h3 className="font-medium leading-[23.46px] md:text-[20px] text-base pb-[24px] text-[#191930] font-sans">
              {i18n?.t("Select Available Date")}
            </h3>
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-base pb-[24px] font-sans text-[#242628] flex items-center gap-1">
                <FaRegCalendarAlt /> {viewDate}
              </h3>
              {selectDate && (
                <button
                  onClick={() => {
                    setselectDate("");
                    setSelectSlot("");
                    setViewDate(dayjs().format("dddd, D MMMM YYYY"));
                  }}
                  className="text-primary font-medium text-base pb-[24px] font-sans"
                >
                  {i18n?.t("Change")}
                </button>
              )}
            </div>
            <div>
              {selectDate ? (
                <div>
                  <div className="flex justify-between mb-[24px] items-center px-2 py-6 border-b border-b-[#D9D9D9]">
                    <h3 className="font-medium text-base font-sans text-[#242628]">
                      {i18n?.t("Available time slots")}
                    </h3>

                    <div className="flex items-center gap-[24px]">
                      <button
                        onClick={() => handlePageChange("prev")}
                        disabled={pageCount === 1}
                        className="hover:text-blue-600 text-textColor"
                      >
                        <TfiAngleLeft className="text-[16px]" />
                      </button>
                      <button
                        onClick={() => handlePageChange("next")}
                        disabled={
                          pageCount * slotsPerPage >= datewiseSlot?.length
                        }
                        className="hover:text-blue-600 text-textColor"
                      >
                        <TfiAngleRight className="text-[16px]" />
                      </button>
                    </div>
                  </div>
                  {paginatedSlots?.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-3 gap-[14px]">
                        {paginatedSlots?.map((time, index) => (
                          <button
                            key={index}
                            disabled={
                              isPastTime(time) || bookingSlots?.includes(time)
                            }
                            className={`px-4 py-2 m-1 border rounded-[8px] ${
                              time === selectSlot
                                ? "bg-primary bg-opacity-10 text-primary border-primary transition"
                                : "text-[#242628] border-[#E0E0E0]"
                            } text-sm 
            ${
              isPastTime(time) || bookingSlots?.includes(time)
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "hover:bg-primary hover:bg-opacity-10 hover:text-primary hover:border-primary transition"
            }
          `}
                            onClick={() => {
                              setSelectSlot(time);
                            }}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                      <Button
                        type="button"
                        className="w-full mt-[27px]"
                        onClick={() => {
                          setIsCaseDetailsOpen(true);
                          setIsAppointmentOpen(false);
                        }}
                      >
                        {i18n?.t("Continue")}
                      </Button>
                    </div>
                  ) : (
                    <div>{i18n?.t("No slot available")}</div>
                  )}
                </div>
              ) : (
                <Calendar
                  fullscreen={false}
                  disabledDate={disabledDate}
                  onSelect={(value) => {
                    if (isMonthChangingRef.current) return;
                    setViewDate(dayjs(value).format("dddd, D MMMM YYYY"));
                    setselectDate(dayjs(value).format("DD/MM/YYYY"));
                    setPageCount(1);
                  }}
                  headerRender={({ value, type, onChange, onTypeChange }) => {
                    const current = value.format("MMMM YYYY");
                    return (
                      <div className="flex justify-between items-center px-2 py-4">
                        <div className="text-base font-semibold text-[#242628] font-sans">
                          {current}
                        </div>
                        <div className="flex items-center gap-[24px]">
                          <button
                            onClick={() =>
                              handleMonthChange(
                                value.clone().subtract(1, "month"),
                                onChange
                              )
                            }
                            className="hover:text-blue-600 text-textColor"
                          >
                            <TfiAngleLeft className="text-[16px]" />
                          </button>
                          <button
                            onClick={() =>
                              handleMonthChange(
                                value.clone().add(1, "month"),
                                onChange
                              )
                            }
                            className="hover:text-blue-600 text-textColor"
                          >
                            <TfiAngleRight className="text-[16px]" />
                          </button>
                        </div>
                      </div>
                    );
                  }}
                />
              )}
            </div>
          </div>
        </div>
        <Messsage
          setIsAppointmentOpen={setIsAppointmentOpen}
          open={open}
          setOpen={setOpen}
          data={senderId}
        />
      </div>
    </Modal>
  );
};

export default CalendarModal;
