interface ICongratulation {
  message: string;
}

const Congratulation = ({ message }: ICongratulation) => {
  return (
    <div className="whiteBoxHldr">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 mb-5 loginHldr">
            <div className="form-section">
              <div className="row">
                <div className="col-12 text-center CongratulationsWrapper">
                  <i className="icon-verify" />
                  <p className="mb-3 fw-bolder mt-3 txt-24">{message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Congratulation;
