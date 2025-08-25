import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X } from "lucide-react";

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const CookieConsent = ({ onAccept, onDecline }: CookieConsentProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('loomi-cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('loomi-cookie-consent', 'accepted');
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('loomi-cookie-consent', 'declined');
    setIsVisible(false);
    onDecline();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="p-4 shadow-glow border-border/50 bg-card/95 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <Cookie className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">Cookie Consent</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We use necessary cookies to store your music preferences locally. No tracking or analytics cookies are used.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleAccept}
                size="sm"
                className="bg-gradient-primary hover:opacity-90 text-white"
              >
                Accept
              </Button>
              <Button 
                onClick={handleDecline}
                size="sm"
                variant="outline"
              >
                Decline
              </Button>
            </div>
          </div>
          <Button
            onClick={handleDecline}
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};