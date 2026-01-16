"use client";
import React, { useState } from "react";
import { Form, Input, message, Modal, notification } from "antd";
import { useAction } from "@/app/helpers/hooks";
import { postForgot, resetPassword } from "@/app/helpers/backend";
import { useRouter } from "next/navigation";
import { FiLock, FiUnlock } from "react-icons/fi";
import Password from "antd/es/input/Password";
import { useUser } from "@/app/context/userContext";
import Banner from "@/app/components/common/banner";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [continuing, setContinuing] = useState(false);
  const { user, otpPayload, setOtpPayload, setUser, getUserdata } = useUser();
  const { push } = useRouter();

  return (
    <div>
    <Banner title="Reset Password"/>
    <div >

      <div className="w-fit mx-auto p-10 shadow-lg xl:mb-[150px] md:mb-14 mb-[60px]">
        <div className="md:flex flex-col justify-center items-center ">
          <div className="md:max-w-md relative z-10">
            <h1 className="m:text-2xl text-2xl font-bold mb-4 md:mt-0 mt-5 text-center">
              {"Change your password"}?
            </h1>
         
            <Form
              onFinish={async (values) => {
                setContinuing(true);
                console.log("otpPayload",otpPayload);
                try {
                  const data = await resetPassword({
                    newPassword: values?.password,
                    confirmPassword: values?.confirmPassword,
                    token:otpPayload?.token,
                  });

                  if (data?.error) {
                    message.error(data?.msg || data?.message);
                    setContinuing(false);
                    return;
                  } else {
                    localStorage.removeItem("token");
                    message.success(data?.msg || data?.message);
                    setUser({});
                    push("/");
                    getUserdata();
                    setContinuing(false)
                  }

                } catch (err) {
                  setContinuing(false)
                }
                finally{
                  setContinuing(false)
                }
              }}
            >
              <div className="w-full">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold ">Password</label>
                  <Form.Item
                    name={"password"}
                    rules={[
                      {
                        required: true,
                        message: "Please enter your password",
                      },
                    ]}
                  >
                    <Input.Password
                      placeholder={"**************"}
                      className="border border-[#E0E0E0] rounded-[10px] ps-[20px] w-full pt-[19px] pb-[18px] h-[56px]"
                      iconRender={(visible) =>
                        visible ? (
                          <FiUnlock size={16} style={{ color: "#9CA3AF" }} />
                        ) : (
                          <FiLock size={16} style={{ color: "#9CA3AF" }} />
                        )
                      }
                    />
                  </Form.Item>
                </div>
                <Form.Item
                  name={"confirmPassword"}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value) {
                          return Promise.reject("Please confirm your password!");
                        }
                        if (getFieldValue('password') !== value) {
                          return Promise.reject("The two passwords do not match!");
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder={"**************"}
                    className="border border-[#E0E0E0] rounded-[10px] ps-[20px] w-full pt-[19px] pb-[18px] h-[56px]"
                    iconRender={(visible) =>
                      visible ? (
                        <FiUnlock size={16} style={{ color: "#9CA3AF" }} />
                      ) : (
                        <FiLock size={16} style={{ color: "#9CA3AF" }} />
                      )
                    }
                  />
                </Form.Item>
              </div>
              <button
                type="submit"
                className="bg-secondary hover:bg-primary duration-300 ease-in-out text-white px-4 py-3 rounded-md w-full"
                disabled={continuing}
              >
                {continuing ? "Loading" : "Continue"}
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ForgetPassword;
