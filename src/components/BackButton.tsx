import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  width?: boolean;
}

const BackButton = ({ width }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      className={`btn btn-black-line text-center ${width && "w-100"}`}
      onClick={() => navigate(-1)}
      label="Back"
    />
  );
};

export default BackButton;
