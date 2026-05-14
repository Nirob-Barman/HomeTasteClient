import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500 text-2xl">
            ⚠
          </div>
          <h2 className="text-base font-semibold text-gray-800">Something went wrong</h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={this.reset}
            className="mt-4 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
