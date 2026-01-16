"use client";
import { useState } from "react";
import CaseDetailsModal from "./modal/casedetailsModal";
import PaymentModal from "./modal/paymentModal";
import RecommendAttorney from "./modal/recommendedModal";
import SuccessModal from "./modal/successModal";
import { useModal } from "@/app/context/modalContext";
import CalendarModal from "./modal/calendermodal";
import { useUser } from "@/app/context/userContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);                  
dayjs.extend(timezone);           
dayjs.extend(customParseFormat);
const Appointment = () => {
  const {
    isAppointmentOpen,
     attorneyDetalis,
     setIsAppointmentOpen
  } = useModal();
  const [formData, setFormData] = useState({});
  const [isCaseDetaiOpen, setIsCaseDetailsOpen] = useState(false);
  const [isPaymentModal, setIsPaymentModal] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const { isRecommended, setIsRecommended } = useModal();
  const [selectDate, setselectDate] = useState(dayjs().format('DD/MM/YYYY'));
  const [selectSlot, setSelectSlot] = useState("");
  const [caseDetailsValue, setCaseDetailsValue] = useState(null);
  const [paymentValue, setPaymentValue] = useState({});

  return (
    <div>
      {isAppointmentOpen && (
        <CalendarModal
          availability={attorneyDetalis?.availability || []} 
          data={attorneyDetalis}
          setselectDate={setselectDate}
          selectSlot={selectSlot}
          setSelectSlot={setSelectSlot}
          setIsCaseDetailsOpen={setIsCaseDetailsOpen}
          selectDate={selectDate}
        />
      )}
      {isCaseDetaiOpen && selectDate && selectSlot && (
        <CaseDetailsModal
        setCaseDetailsValue={setCaseDetailsValue}
          isCaseDetaiOpen={isCaseDetaiOpen}
          setIsCaseDetailsOpen={setIsCaseDetailsOpen}
          selectSlot={selectSlot}
          selectDate={selectDate}
          setIsPaymentModal={setIsPaymentModal}
          attorneyDetalis={attorneyDetalis} 
          caseDetailsValue={caseDetailsValue}
          setIsAppointmentOpen={setIsAppointmentOpen}

        />
      )}
      {isPaymentModal && (
        <PaymentModal
          setPaymentValue={setPaymentValue}
          isPaymentModal={isPaymentModal}
          setIsPaymentModal={setIsPaymentModal}
          setIsRecommended={setIsRecommended}
          setIsSuccessModal={setIsSuccessModal}
          setIsCaseDetailsOpen={setIsCaseDetailsOpen}
          paymentValue={paymentValue}
          formData={{
            ...caseDetailsValue,
            attorneyId: attorneyDetalis?._id,
            select_date:dayjs.utc(selectDate, "DD/MM/YYYY").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
              slot_time: selectSlot,
              method: paymentValue?.method?.toLowerCase() || "",
              "currency":"USD"
          }}
        />
      )}
      {isRecommended && (
        <RecommendAttorney
          isRecommended={isRecommended}
          setIsRecommended={setIsRecommended}
        />
      )}
      {isSuccessModal && (
        <SuccessModal
          isSuccessModal={isSuccessModal}
          setIsCaseDetailsOpen={setIsCaseDetailsOpen}
          setIsSuccessModal={setIsSuccessModal}
          
          formData={{
            ...caseDetailsValue,
            attorneyId: attorneyDetalis?._id,
              select_date: dayjs(selectDate, "DD/MM/YYYY")
              .utc()
              .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
              slot_time: selectSlot,
              method: paymentValue?.method?.toLowerCase() || "",
              "currency":"USD"
          }}
        />
      )}
    </div>
  );
};

export default Appointment;
