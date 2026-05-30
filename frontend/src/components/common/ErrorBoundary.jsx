import { Component } from "react";
import GlobalErrorPage from "../../pages/public/GlobalErrorPage";

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
      return <GlobalErrorPage />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
