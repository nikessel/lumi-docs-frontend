import { useEffect } from "react"
import { useUploadManager } from "@/components/upload-files/upload-manager";
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { notification } from "antd";


const UploadIndicator = () => {
    const uploadManager = useUploadManager();
    const [api, contextHolder] = notification.useNotification();


    useEffect(() => {
        if (!uploadManager.isUploading && (uploadManager.uploadedFiles > 0 || uploadManager.failedFiles.length || uploadManager.filesAlreadyExisted)) {

            if (uploadManager.failedFiles.length > 0) {
                api.error({
                    message: "Error",
                    description: `Failed to upload ${uploadManager.failedFiles.length} files`
                });
            }

            if (uploadManager.uploadedFiles > 0 || uploadManager.filesAlreadyExisted) {
                const lines = [];

                if (uploadManager.uploadedFiles > 0) {
                    lines.push(`Successfully uploaded ${uploadManager.uploadedFiles} files.`);
                }

                if (uploadManager.filesAlreadyExisted > 0) {
                    lines.push(`${uploadManager.filesAlreadyExisted} files already existed.`);
                }

                api.success({
                    message: "Success",
                    description: lines.join("\n"),
                });


            }
        }
    }, [uploadManager, api]);

    if (!uploadManager.isUploading) return <div>{contextHolder}</div>;

    return (
        <div style={{
            position: "fixed",
            top: 5,
            right: 10,
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 9999,
            color: "gray"
        }}
        >
            <Spin indicator={<LoadingOutlined spin />} size="small" />
            Uploading {uploadManager.uploadedFiles}/{uploadManager.totalFiles}
            {contextHolder}
        </div>
    );
};

export default UploadIndicator;
