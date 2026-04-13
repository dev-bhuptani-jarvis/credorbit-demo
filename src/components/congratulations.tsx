import { useEffect, useState } from "react";

const Congratulations = () => {
  const [timer, setTimer] = useState<number>(5);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  return (
    <div className="loginWrapper">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 loginHldr">
            <div className="form-section">
              <div className="row">
                <div className="col-12 text-center CongratulationsWrapper">
                  <i className="icon-verify"/>
                  <p className="mb-3 fw-bolder mt-3">
                    Congratulations! You're now registered with Credorbit
                  </p>
                  <p className="txt-14">
                    You'll be redirected to the dashboard in 00:0{timer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Congratulations;
