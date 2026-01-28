import { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SecretAdminButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setShowDialog(true);
    setCode("");
    setError(false);
  };

  const handleSubmit = () => {
    if (code === "8890") {
      setShowDialog(false);
      setLocation("/admin");
    } else {
      setError(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-4 right-4 w-12 h-12 opacity-0 cursor-default z-50"
        data-testid="button-secret-admin"
        aria-label="Secret admin access"
      />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="sr-only">Access</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder=""
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              onKeyDown={handleKeyDown}
              data-testid="input-admin-code"
              className={error ? "border-destructive" : ""}
              autoFocus
            />
            <Button onClick={handleSubmit} data-testid="button-submit-code">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
