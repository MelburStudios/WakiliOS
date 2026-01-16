"use client";
import React from "react";
import { Modal, Button } from "antd";
import { IoClose } from "react-icons/io5";

const RecommendAttorney = ({ isRecommended, setIsRecommended }) => {
  const handleNext = () => {
    setIsRecommended(false);
  };

  return (
    <Modal
      visible={isRecommended}
      onCancel={() => setIsRecommended(false)}
      footer={null}
    >
      <div className="w-full mx-auto bg-white rounded-[20px] p-[10px] relative">
        <button
          className="w-[32px] h-[32px] rounded-full bg-[#EDEDED] absolute sm:right-0 right-[2px] top-[2px] sm:top-0 inline-flex justify-center items-center"
          onClick={() => setIsRecommended(false)}
        >
          <IoClose
            size={20}
            className="text-[#242628] text-[12px] cursor-pointer"
          />
        </button>
        <h3 className="font-medium leading-[23.46px] text-[20px] pb-[24px] text-[#191930] font-ebgramond">
          Recommended Attorney
        </h3>
        <p>We recommend the following attorney based on your case details:</p>
        <Button type="primary" className="w-full mt-[27px]" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </Modal>
  );
};

export default RecommendAttorney;