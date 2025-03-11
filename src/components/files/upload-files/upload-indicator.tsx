import { useEffect } from "react";
import { useUploadManager } from "@/components/files/upload-files/upload-manager";
import { notification, Progress, Card } from 'antd';
import { 
  LoadingOutlined, 
  FileOutlined, 
  CloseCircleFilled,
} from '@ant-design/icons';

const UploadIndicator = () => {
  const uploadManager = useUploadManager();
  const [api, contextHolder] = notification.useNotification();

  // Calculate upload statistics
  const progress = Math.round(uploadManager.progress * 100);
  const uploadedCount = Math.min(uploadManager.uploadedFiles, uploadManager.totalFiles);
  const totalCount = uploadManager.totalFiles;
  const failedCount = uploadManager.failedFiles.length;
  const alreadyExistedCount = uploadManager.filesAlreadyExisted;
  const isComplete = !uploadManager.isUploading && (uploadedCount > 0 || failedCount > 0 || alreadyExistedCount > 0);
  
  // Show notification when upload completes
  useEffect(() => {
    if (isComplete) {
      if (failedCount > 0) {
        api.error({
          message: "Upload Error",
          description: `Failed to upload ${failedCount} files`
        });
      }
      
      if (uploadedCount > 0 || alreadyExistedCount > 0) {
        const lines = [];
        if (uploadedCount > 0) {
          lines.push(`Successfully uploaded ${uploadedCount} files.`);
        }
        if (alreadyExistedCount > 0) {
          lines.push(`${alreadyExistedCount} files already existed.`);
        }
        api.success({
          message: "Upload Complete",
          description: lines.join("\n"),
        });
      }
    }
  }, [uploadManager.isUploading, uploadedCount, failedCount, alreadyExistedCount, api, isComplete]);

  // If not uploading and no recent completion, don't show anything
  if (!uploadManager.isUploading && !isComplete) {
    return <div>{contextHolder}</div>;
  }

  // Show the indicator for 5 seconds after completion
  if (isComplete) {
    return <div>{contextHolder}</div>;
  }
  
  // Render expanded version (detailed card)
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 1000,
        width: 300,
      }}
    >
      <Card 
        size="small" 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <LoadingOutlined spin style={{ marginRight: 8 }} />
              Uploading Files
            </span>
          </div>
        }
        styles={{ body: { padding: '12px' } }}
      >
        <Progress 
          percent={progress} 
          status="active" 
          size="small"
          strokeWidth={6}
        />
        
        <div style={{ 
          marginTop: 8,
          fontSize: '13px',
          color: 'rgba(0, 0, 0, 0.65)'
        }}>
          <div>
            <FileOutlined style={{ marginRight: 4 }} />
            {uploadedCount}/{totalCount} files
          </div>
        </div>
        
        {failedCount > 0 && (
          <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: '13px' }}>
            <CloseCircleFilled style={{ marginRight: 4 }} />
            {failedCount} failed files
          </div>
        )}
      </Card>
      {contextHolder}
    </div>
  );
};

export default UploadIndicator;
