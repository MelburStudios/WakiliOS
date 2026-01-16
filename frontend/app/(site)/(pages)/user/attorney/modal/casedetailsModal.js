"use client";
import React, { useState } from "react";
import { Form, Grid,  Modal, Select, Spin } from "antd";
import { IoClose } from "react-icons/io5";
import UploadFileComponent from "@/app/components/common/form/pdfUpload";
import { useFetch } from "@/app/helpers/hooks";
import { fetchSpecialization, pdfFileUpload } from "@/app/helpers/backend";
import { useI18n } from "@/app/providers/i18n";

const CaseDetailsModal = ({
  isCaseDetaiOpen,
  setIsCaseDetailsOpen,
  setCaseDetailsValue,
   setIsPaymentModal,
   setIsAppointmentOpen
}) => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const getModalWidth = () => {
    if (screens.xxl) {
      return 892;
    } else if (screens.xl) {
      return 710;
    } else if (screens.lg) {
      return 700;
    } else if (screens.md) {
      return 600;
    } else if (screens.sm) {
      return 500;
    } else {
      return "100%";
    }
  };
  const i18n = useI18n();
  const [data] = useFetch(fetchSpecialization, {});
  const [fileList, setFileList] = useState([]);
 
  const [loading2, setLoading2] = useState(false);
  const handleFinish = async (values) => {
    setLoading2(true);
    let evidenceList = [];

    if (values?.evidence?.fileList?.length > 0) {
      for (const file of values.evidence.fileList) {
        if (file?.originFileObj) {
          const { error, data } = await pdfFileUpload({
            files: file.originFileObj,
          });
          evidenceList?.push(data);
        }
      }
    }

    if (values) {
      setCaseDetailsValue({
        ...values,
        evidence: evidenceList,
        case_type: values?.case_type,
        short_description: values?.short_description,
        case_history: values?.case_history,
      });
      setIsCaseDetailsOpen(false);
      setIsPaymentModal(true);
      setLoading2(false);
      setIsAppointmentOpen(false);
    }
  };
  if (loading2) {
    return <Spin fullscreen />;
  }
  return (
    <Modal
      className="!bg-transparent"
      footer={null}
      closeIcon={false}
      open={isCaseDetaiOpen}
      onCancel={() => setIsCaseDetailsOpen(false)}
      style={{ position: "relative", zIndex: "200" }}
      width={getModalWidth()}
    >
      <div className="lg:max-w-[872px] w-full mx-auto bg-white rounded-[20px] p-[10px] relative ">
        <button
          className="w-[32px] h-[32px] rounded-full bg-[#EDEDED] absolute sm:top-0 top-[2px] right-[2px]  sm:right-0 inline-flex justify-center items-center"
          onClick={() => {
            setIsCaseDetailsOpen(false);
          }}
        >
          <IoClose
            size={20}
            className="text-[#242628] text-[12px] cursor-pointer"
          />
        </button>

        <h3 className="font-medium leading-[23.46px] text-[20px] pb-[24px] text-[#191930] font-ebgramond ">
          {i18n?.t("Case Detail's")}
        </h3>
        <Form onFinish={handleFinish} layout="vertical">
       

          <Form.Item
            label={
              <p className="text-base font-medium text-[#242628] mb-[12px]">
                {i18n?.t("Case Type")}
              </p>
            }
            name="case_type"
            rules={[{ required: true, message: i18n?.t("Please select a case type") }]}
          >
            <Select
              placeholder={i18n.t("Select Case Type")}
              allowClear
              showSearch
              className={"h-[50px]"}
            >
              {data?.docs?.map((cat) => (
                <Select.Option key={cat?.name} value={cat?.name}>
                  {cat?.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="short_description"
            label={
              <p className="text-base font-medium text-[#242628] mb-[12px]">
                {i18n?.t("Case Short Description")}
              </p>
            }
            rules={[{ required: true, message: i18n?.t("Please enter description") }]}
          >
            <textarea
              maxLength={500}
              minLength={10}
              type="text"
              className="w-full placeholder:text-base placeholder:font-normal  px-4 py-2 lg:h-[180px] md:h-[180px] h-[4rem] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent "
              placeholder={i18n?.t("This case involves Party A and Party B, concerning the alleged murder of Victim's Name.")}
              required
            />
          </Form.Item>
          <Form.Item
            name="case_history"
            label={
              <p className="text-base font-medium text-[#242628] mb-[12px]">
                {i18n?.t("Case History")}
              </p>
            }
            rules={[{ required: true, message: i18n?.t("Please enter case_history") }]}
          >
            <textarea
              type="text"
              maxLength={50}
              className="w-full placeholder:text-base placeholder:font-normal  px-4 py-2 lg:h-[180px] md:h-[180px] h-[4rem] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent "
              placeholder={i18n?.t("This case involves Party A and Party B, concerning the alleged murder of Victim's Name.")}
            />
          </Form.Item>
        
          <div className="mb-2">
            <UploadFileComponent
              className={"p-[8px]"}
              max={1}
              name="evidence"
              fileList={fileList}
              setFileList={setFileList}
              rules={[{ required: true, message: i18n?.t("Please upload pdf") }]}
              label={
                <p className="text-base font-medium text-[#242628] mb-[12px]">
                  {i18n?.t("Evidence")}{" "}
                </p>
              }
            />
          </div>
          <button
          
            type="submit"
            className={`border-2 bg-primary  button text-white hover:bg-transparent hover:text-primary border-primary lg:px-8 text-textMain !font-poppins md:px-4 h-fit py-4 px-4 whitespace-pre rounded-[8px] transition-all !font-medium duration-300 ease-in-out sm:text-base capitalize text-sm `}
          >
            {i18n?.t("Continue")}
          </button>
        </Form>
      </div>
    </Modal>
  );
};

export default CaseDetailsModal;
