
import ReactDOM from "react-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertCircle, Loader2 } from "lucide-react";

const Backdrop = (props) => {
  return <div className="fixed inset-0 bg-black/50 z-50" onClick={props.onClick} />;
};

function Confirmation(props) {
  return (
    <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform">
      <div className="bg-background/90 backdrop-blur-md border rounded-lg shadow-lg p-6">
        <div className="flex items-start space-x-4">
          <AlertCircle className="h-6 w-6 text-destructive mt-0.5" />
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-subheading">Error</h3>
              <p className="text-body-small text-muted-foreground mt-1">{props.text}</p>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={props.onClick} className="transition-all duration-300 hover:scale-105">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 transform">
      <div className="bg-background/90 backdrop-blur-md border rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <div>
            <h3 className="text-subheading">Loading...</h3>
            <p className="text-body-small text-muted-foreground">Please wait</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorModal({ children, onClick, isLoading = false }) {
  return (
    <>
      {isLoading ? (
        <>
          {ReactDOM.createPortal(
            <Backdrop onClick={onClick} />,
            document.getElementById("backdrop-root")
          )}
          {ReactDOM.createPortal(
            <Loading onClick={onClick} />,
            document.getElementById("modal-root")
          )}
        </>
      ) : (
        <>
          {ReactDOM.createPortal(
            <Backdrop onClick={onClick} />,
            document.getElementById("backdrop-root")
          )}
          {ReactDOM.createPortal(
            <Confirmation onClick={onClick} text={children} />,
            document.getElementById("modal-root")
          )}
        </>
      )}
    </>
  );
}

export default ErrorModal;
