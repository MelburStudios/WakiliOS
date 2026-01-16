"use client";
import React, { use, useEffect, useRef, useState } from "react";
import { Calendar, Checkbox, message } from "antd";
import { TfiAngleLeft, TfiAngleRight } from "react-icons/tfi";
import dayjs from "dayjs";
import Button from "@/app/components/common/button";
import { getAvailbility, postAvailbility } from "@/app/helpers/backend";
import { useFetch } from "@/app/helpers/hooks";
import { useUser } from "@/app/context/userContext";
import { useI18n } from "@/app/providers/i18n";


const Availablity = () => {
  const slots = [
    "9.00AM",
    "10.00AM",
    "11.00AM",
    "12.00PM",
    "1.00PM",
    "2.00PM",
    "3.00PM",
    "4.00PM",
    "5.00PM",
    "6.00PM",
    "7.00PM",
    "8.00PM",
    "9.00PM",
    "10.00PM",
    "11.00PM",
    
  ];
  const { user, setUser } = useUser();
  const [data, getData, { loading }] = useFetch(getAvailbility, {});
  const getAttorney = data?.find((i) => i?.email === user?.email);
  const [selectDate, setSelectDate] = useState(null);
  const [selectSlots, setSelectSlots] = useState([]);
  const i18n = useI18n();
 

  useEffect(()=>{
  if(!selectDate){
    setSelectDate(getAttorney?.availability[0]?.date);
  }
  },[getAttorney?.availability])
  useEffect(() => {
    if (data?.availability) {
      setSelectSlots(data.availability);
    }
  }, [data]);

  const isMonthChangingRef = useRef(false);

  const handleMonthChange = (newValue, onChange) => {
    isMonthChangingRef.current = true;
    onChange(newValue);
    setTimeout(() => {
      isMonthChangingRef.current = false;
    }, 200);
  };

  const handleDateSelect = (value) => {
    if (isMonthChangingRef.current) return;
    const formattedDate = dayjs(value).format("DD/MM/YYYY");
    setSelectDate(formattedDate);
  };
  const handleSlotChange = (slot) => {
    if (!selectDate) return;

    setSelectSlots((prev) => {
      const existingIndex = prev.findIndex((item) => item.date === selectDate);
      if (existingIndex !== -1) {
        const updatedSlots = prev[existingIndex].timeSlots.includes(slot)
          ? prev[existingIndex].timeSlots.filter((s) => s !== slot)
          : [...prev[existingIndex].timeSlots, slot];

        const updatedAvailability = [...prev];
        updatedAvailability[existingIndex] = {
          date: selectDate,
          timeSlots: updatedSlots,
        };
        return updatedAvailability;
      }
      return [...prev, { date: selectDate, timeSlots: [slot] }];
    });
  };

  const handleSave = async () => {
    const updatedAvailability = [...getAttorney?.availability]; 
  
    selectSlots.forEach((newSlot) => {
      const existingIndex = updatedAvailability.findIndex(
        (item) => item.date === newSlot.date
      );
  
      if (existingIndex !== -1) {

        updatedAvailability[existingIndex].timeSlots = Array.from(
          new Set([...updatedAvailability[existingIndex].timeSlots, ...newSlot.timeSlots])
        );
      } else {

        updatedAvailability.push(newSlot);
      }
    });
  
    const payload = { availability: updatedAvailability };
  
    const data2 = await postAvailbility(payload);
    if (!data2?.error) {
      message.success(data2?.msg || data2?.message);
    } else {
      message.error(data2?.msg || data2?.message);
    }
  };
  

  return (
    <div>
      <h1 className="dashboard-title md:py-[38px] py-[17px] md:px-12 sm:px-8 px-[22px] border-b-2">
        {i18n?.t("Availablity")}
      </h1>
      <div className="lg:p-10 p-5">
        <div className="grid sm:grid-cols-3 grid-cols-1 gap-6">
          <div className="sm:col-span-2 md:max-w-[596px] attorney">
            <h2 className="text-[20px] font-medium mb-5 md:mb-10">
              {i18n?.t("Select Date & Time")}
            </h2>
            <Calendar
              fullscreen={false}
              dateFullCellRender={(value) => {
                const formattedDate = dayjs(value).format("DD/MM/YYYY");
                const isAvailable = selectSlots.some(
                  (item) => item.date === formattedDate
                );
                const isPastDate = dayjs(value).isBefore(dayjs(), "day");
                const isAttorneyAvailable = getAttorney?.availability?.some(
                  (item) => item.date === formattedDate
                );

                return (
                  <div
                    className={`p-2 text-center rounded ${
                      isPastDate
                        ? "bg-transparent border-transparent"
                        : isAvailable ||
                          selectDate?.includes(formattedDate) ||
                          isAttorneyAvailable
                        ? "border-primary bg-primary bg-opacity-10 text-primary border m-2 rounded-[8px]"
                        : "bg-transparent"
                    }`}
                  >
                    {value.date()}
                  </div>
                );
              }}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
              headerRender={({ value, onChange }) => {
                const current = value.format("MMMM YYYY");
                return (
                  <div className="flex justify-between items-center px-2 xl:px-8 py-4">
                    <div className="text-base font-semibold">{current}</div>
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
              onSelect={handleDateSelect}
            />
          </div>

          {selectDate && (
            <div className="md:max-w-[268px] w-full">
              <h2 className="text-[20px] text-center font-medium md:mb-10 mb-5">
                {i18n?.t("Show Time I'm Free")}
              </h2>
              <div className="flex flex-col gap-4 h-[440px] overflow-y-auto custom-scrollbar">
                {slots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex px-[20px] border border-[#EDEDED] rounded-[10px] justify-between items-center text-base py-4"
                  >
                    <Checkbox
                      checked={
                        selectSlots
                          .find((item) => item.date === selectDate)
                          ?.timeSlots.includes(slot) ||
                        getAttorney?.availability
                          ?.find((item) => item.date === selectDate)
                          ?.timeSlots.includes(slot) ||
                        false
                      }
                      onChange={() => handleSlotChange(slot)}
                    />
                    <p>{slot}</p>
                    <p> </p>
                  </div>
                ))}
              </div>
              <div className="grid place-content-end">
                <Button className="mt-[50px]" onClick={handleSave}>
                  {i18n?.t("Save Time & Date")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Availablity;
