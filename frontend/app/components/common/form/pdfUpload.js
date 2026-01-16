import React, { useEffect, useState } from "react";
import { Upload, Button, Form } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useI18n } from "@/app/providers/i18n";

const UploadFileComponent = ({ max = 1, name = "file", label, fileList, setFileList ,className,rules}) => {
  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList); 
  };
  const i18n = useI18n();
  const handleBeforeUpload = (file) => {
    const isPDF = file.type === "application/pdf";
    if (!isPDF) {
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  return (
    <Form.Item label={label} name={name} rules={rules}>
      <Upload
        name={name}
        accept=".pdf"
        fileList={fileList} 
        beforeUpload={handleBeforeUpload}
        onChange={handleChange}
        maxCount={max}
      >
        <div className={`w-full border p-2 ${className} rounded-lg gap-2 flex`}><UploadOutlined />{i18n?.t('Click to Upload')}</div>
      </Upload>
    </Form.Item>
  );
};

export default UploadFileComponent;
