import { Component } from "react";
import FeedbackBanner from "./FeedbackBanner";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("UI boundary caught error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <FeedbackBanner
            type="error"
            title="Something went wrong"
            message="Refresh the page or try the action again. Your session was not changed."
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
