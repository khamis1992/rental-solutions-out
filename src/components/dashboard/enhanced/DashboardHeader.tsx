
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Calendar, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DashboardHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState({ text: "", author: "" });

  // Update the time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Set the greeting based on time of day
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, [currentTime]);
  
  // Set a motivational quote
  useEffect(() => {
    const quotes = [
      { text: "The road to success is always under construction.", author: "Lily Tomlin" },
      { text: "Quality in a service is not what you put into it. It's what the customer gets out of it.", author: "Peter Drucker" },
      { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
      { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
      { text: "Don't find customers for your products, find products for your customers.", author: "Seth Godin" },
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);
  
  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <Card className="relative overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10" />
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{greeting}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
              <span className="mx-1">•</span>
              <span>{formattedTime}</span>
            </div>
            <p className="text-sm italic text-muted-foreground hidden sm:block">
              "{quote.text}" <span className="font-medium">— {quote.author}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-primary/10">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-primary/10">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-primary/10">
              <UserCircle className="h-4 w-4" />
              <span className="sr-only">Profile</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
