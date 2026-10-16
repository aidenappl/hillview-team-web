import React from "react";
import { reportError } from "../../services/monitor.service";

interface ErrorBoundaryState {
	hasError: boolean;
}

interface ErrorBoundaryProps {
	children: React.ReactNode;
}

class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.warn("ErrorBoundary caught an error:", error, errorInfo);
		reportError("client.error.boundary", error, {
			reason: "render_error",
			component_stack: errorInfo.componentStack ?? undefined,
			outcome: "the error page was shown; the user can retry",
		});
	}

	handleReset = () => {
		this.setState({ hasError: false });
	};

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ padding: "2rem", textAlign: "center" }}>
					<h2>Something went wrong</h2>
					<button
						onClick={this.handleReset}
						style={{
							marginTop: "1rem",
							padding: "0.5rem 1rem",
							cursor: "pointer",
						}}
					>
						Try Again
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
