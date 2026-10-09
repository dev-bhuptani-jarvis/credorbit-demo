import { Component, ReactNode } from "react";
import { Button } from "primereact/button";
import { dashboardRoute } from "../utils/functions/appRuntime";
import store from "../store";

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

  private handleBackToHomePage = (): void => {
    const userType = store.getState().user.user.userType;

    window.location.assign(dashboardRoute(userType));
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
              onClick={this.handleBackToHomePage}
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
