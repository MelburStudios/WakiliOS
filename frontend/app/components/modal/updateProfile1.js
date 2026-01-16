"use client";
import { IoClose } from "react-icons/io5";
import { Form, Modal } from "antd";
import { TbArrowRightToArc } from "react-icons/tb";
import { useModal } from "../../context/modalContext";
import PhoneNumberInput from "../common/form/phoneNumberInput";
import { useUser } from "@/app/context/userContext";
import MultipleImageInput from "../common/form/multiImage";
import { postSingleImage } from "@/app/helpers/backend";
import { useI18n } from "@/app/providers/i18n";
import { useEffect } from "react";

const UpdateProfile1 = () => {
  const [form] = Form.useForm();
  const { user, getUserdata,  setOtpPayload } = useUser();
  const i18n = useI18n();
  const {
    openSignUp,
   isProfileUpdate1,
    closeUpdateProfile1,
    openUpdateProfile2,
  } = useModal();
  const handleFinish = async (values) => {
    if (values?.image[0]?.originFileObj) {
      const image = values?.image[0]?.originFileObj;
      const { data } = await postSingleImage({
        image: image,
        image_name: "image",
      });
      values.image = data;
    } else {
      values.image = values?.image[0]?.url;
    }
    setOtpPayload({ ...values });
    getUserdata();
    openUpdateProfile2();
    closeUpdateProfile1();
    return;
  };
  useEffect(() => {
    form.setFieldsValue({
      fullName: user?.name,
    });
  }, [user?._id || user?.id]);
  return (
    <Modal
      footer={null}
      className=" w-full !bg-transparent "
      closeIcon={false}
      open={isProfileUpdate1}
      onCancel={closeUpdateProfile1}
      styles={{ position: "relative", zIndex: "200" }}
      maskClosable={false}
    >
      <div className="sm:max-w-[488px] w-full  mx-auto bg-white rounded-[20px] p-4 sm:p-10 relative">
        <button
          className="w-[32px] h-[32px] rounded-full bg-[#EDEDED] absolute right-6 top-6 inline-flex justify-center items-center"
          onClick={() => {
            closeUpdateProfile1();
          }}
        >
          <IoClose
            size={20}
            className="text-[#242628] text-[12px] cursor-pointer"
          />
        </button>
        <div className="w-[40px] h-[40px] mb-[40px]">
          <TbArrowRightToArc
            className="text-[33.33px] text-[#242628] cursor-pointer"
            onClick={() => {
              if (user) {
                openSignUp();
                closeUpdateProfile1();
              }
            }}
          />
        </div>
        <h2 className="leading-[32.84px] text-[28px]  font-semibold text-[#242628] mb-[40px] ">
          {i18n?.t("Update Your Profile")}
        </h2>

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <>
            <Form.Item
              label={
                <p className="text-base font-medium text-[#242628] ">
                  {i18n?.t("Full Name")}
                </p>
              }
              name="fullName"
              className="!w-full  profile-update"
              rules={[{ required: true, message: "Please enter your name!" }]}
            >
              <input
                placeholder="john doe"
                type="text"
                className="border border-[#E0E0E0] rounded-[10px] px-[20px] w-full pt-[19px] pb-[18px] h-[56px]"
              />
            </Form.Item>
            <PhoneNumberInput
              name="phoneNo"
              placeholder={"01614790538"}
              label={"Phone Number"}
            />
            <Form.Item
              label={
                <p className="text-base font-medium text-[#242628]">
                  {i18n?.t("Date of Birth")}
                </p>
              }
              name="dob"
              className="profile-update"
              rules={[
                {
                  required: true,
                  message: i18n?.t("Please enter your dob!"),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || new Date(value).getFullYear() <= 2005) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(i18n?.t("Year must be 2005 or earlier"))
                    );
                  },
                }),
              ]}
            >
              <input
                type="date"
                min="1900-01-01"
                max="2005-12-31"
                className="border border-[#E0E0E0] rounded-[10px] px-[20px] w-full pt-[19px] pb-[18px] h-[56px]"
              />
            </Form.Item>
            <Form.Item
              label={
                <p className="text-base font-medium text-[#242628] ">
                  {i18n?.t("Profile Image")}
                </p>
              }
            >
              <MultipleImageInput name="image" required />
            </Form.Item>
            <button
              className={
                "border-2 mb-4 mt-[16px] bg-primary  button text-white hover:bg-transparent w-full hover:text-primary border-primary lg:px-8 text-textMain !font-poppins md:px-4 h-[56px] py-4 px-4 whitespace-pre rounded-[8px] transition-all !font-medium duration-300 ease-in-out sm:text-base capitalize text-sm"
              }
              type="submit"
            >
              {i18n?.t("Next")}
            </button>
          </>
        </Form>
      </div>
    </Modal>
  );
};

export default UpdateProfile1;
