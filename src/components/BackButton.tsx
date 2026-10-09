import { Button } from "primereact/button";
import { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  width?: boolean;
}

const BackButton = ({ width }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBackClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
    navigate(-1);
  };

  return (
    <Button
      className={`btn btn-black-line text-center ${width && "w-100"}`}
      onClick={handleBackClick}
      label="Back"
    />
  );
};

export default BackButton;
