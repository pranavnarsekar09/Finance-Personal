import React from "react";
import { Card } from "./Card";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Something went wrong while rendering FinTrack.",
    };
  }

  componentDidCatch(error) {
    console.error("FinTrack render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-shell justify-center">
          <Card className="mx-auto max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-rose-300">Frontend Error</p>
            <h1 className="mt-3 font-display text-3xl font-bold text-white">The app hit a rendering error.</h1>
            <p className="mt-3 text-sm text-slate-300">{this.state.message}</p>
            <p className="mt-4 text-sm text-slate-500">
              Open the browser console and share the first red error line if this keeps happening.
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
