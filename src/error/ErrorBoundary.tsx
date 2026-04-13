import { Component, ReactNode } from "react";
import { RoutePathConstant } from "../utils/constants/routePaths";
import { Button } from "primereact/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="inner-content">
            <h1 className="sub-content">
              Oops! There was a problem with your request.
            </h1>
            <Button
              className="btn btn-orange"
              onClick={() =>
                window.location.replace(RoutePathConstant.private.dashboard)
              }
            >
              Back to Home Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
