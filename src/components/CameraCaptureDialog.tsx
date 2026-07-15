import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

interface CameraCaptureDialogProps {
  visible: boolean;
  title?: string;
  onHide: () => void;
  onCapture: (dataUrl: string) => void;
}

const CameraCaptureDialog = ({
  visible,
  title = "Capture Photo",
  onHide,
  onCapture,
}: CameraCaptureDialogProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>("");

  useEffect(() => {
    const startCamera = async (): Promise<void> => {
      if (!visible) return;

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera access is not supported on this device or browser.");
        return;
      }

      try {
        setCameraError("");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setCameraError("Unable to access the device camera. Please allow camera permission.");
      }
    };

    const stopCamera = (): void => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    void startCamera();

    return () => {
      stopCamera();
    };
  }, [visible]);

  const handleCapture = (): void => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL("image/png"));
    onHide();
  };

  return (
    <Dialog
      header={title}
      visible={visible}
      onHide={onHide}
      modal
      draggable={false}
      resizable={false}
      blockScroll
      className="modalWrapper"
      style={{ width: "720px", maxWidth: "95vw" }}
      footer={
        <div className="modal-footer gap-3">
          <Button
            className="btn btn-black-line w-100 text-center"
            label="Cancel"
            onClick={onHide}
          />
          <Button
            className="btn btn-orange w-100 text-center"
            label="Capture Photo"
            onClick={handleCapture}
            disabled={!!cameraError}
          />
        </div>
      }
    >
      <div className="text-center">
        {cameraError ? (
          <p className="error mb-0">{cameraError}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              maxHeight: "460px",
              borderRadius: "18px",
              background: "#111827",
              objectFit: "cover",
            }}
          />
        )}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </Dialog>
  );
};

export default CameraCaptureDialog;
