"use client";
import { message, Modal } from "antd";
import { IoClose } from "react-icons/io5";
import Image from "next/image";
import {bookAttorney} from "@/app/helpers/backend";
import { useRouter } from "next/navigation";

const SuccessModal = ({ isSuccessModal, setIsSuccessModal,setIsCaseDetailsOpen, formData }) => {


  const router = useRouter();
  const handleSubmit = async() => {

    try {
      let { data, error, msg } =  await bookAttorney(formData);
      setIsCaseDetailsOpen(false);
      message.success("Case Request Sent Successfully");
      router.push(data);
    } 
      catch (error) {
    }
  };

  return (
    <Modal
      width={600}
      className="!bg-transparent "
      footer={null}
      closeIcon={false}
      open={isSuccessModal}
      onCancel={() => setIsSuccessModal(false)}
      style={{ position: "relative", zIndex: "200" }}
    >
      <div className=" w-full mx-auto bg-white rounded-[20px] p-[10px] relative ">
        <button
          className="w-[32px] h-[32px] rounded-full bg-[#EDEDED] absolute sm:right-0 sm:top-0 top-[2px] right-[2px] inline-flex justify-center items-center"
          onClick={() => {
            setIsSuccessModal(false);
          }}
        >
          <IoClose
            size={20}
            className="text-[#242628] text-[12px] cursor-pointer"
          />
        </button>

        <h3 className="font-medium leading-[23.46px] text-[20px] pb-[24px] text-[#191930] font-ebgramond text-center capitalize ">
          your appointment is complete
        </h3>
        <h4 className="font-medium leading-[23.46px] text-[18px] pb-[48.18px] text-[#191930] font-ebgramond text-center capitalize ">
          now you can send case request
        </h4>
        <Image
          width={323}
          height={170}
          src={"/images/appointSuccess.png"}
          alt="success"
          className="sm:max-w-[323px] max-w-[200px] h-[170px] mx-auto"
        />
        <div className="pt-[50px] flex justify-center sm:flex-row flex-col  gap-[24px] items-center">
          <button
            className="capitalize px-[32px] py-[16px] rounded-[8px] bg-[#EDEDED] text-[#242628] font-sans text-[18px] leading-[24px] font-medium"
            onClick={() => {
              setIsSuccessModal(false);
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="capitalize text-white px-[32px] py-[16px] rounded-[8px] bg-primary font-sans text-[18px] leading-[24px] font-medium"
            onClick={() => {
              handleSubmit();
              setIsSuccessModal(false);
              setIsCaseDetailsOpen(false);
            }}
          >
            Send Case Request
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;